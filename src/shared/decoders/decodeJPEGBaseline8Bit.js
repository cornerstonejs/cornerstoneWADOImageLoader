import libjpegTurboFactory from '@cornerstonejs/codec-libjpeg-turbo-8bit/dist/libjpegturbowasm.js';

// Webpack asset/resource copies this to our output folder
import libjpegTurboWasm from '@cornerstonejs/codec-libjpeg-turbo-8bit/dist/libjpegturbowasm.wasm';

const local = {
  codec: undefined,
  decoder: undefined,
  encoder: undefined,
};

function initLibjpegTurbo() {
  if (local.codec) {
    return Promise.resolve();
  }

  const libjpegTurboModule = libjpegTurboFactory({
    locateFile: f => {
      if (f.endsWith('.wasm')) {
        return libjpegTurboWasm;
      }

      return f;
    },
  });

  libjpegTurboModule.onRuntimeInitialized = evt => {
    console.log('runtime initialized...');
    console.log(evt);
  };

  return new Promise((resolve, reject) => {
    libjpegTurboModule.then(instance => {
      local.codec = instance;
      local.decoder = new instance.JPEGDecoder();
      local.encoder = new instance.JPEGEncoder();
      resolve();
    }, reject);
  });
}

// imageFrame.pixelRepresentation === 1 <-- Signed
/**
 *
 * @param {*} compressedImageFrame
 * @param {object}  imageInfo
 * @param {boolean} imageInfo.signed -
 */
async function decodeAsync(compressedImageFrame, imageInfo) {
  await initLibjpegTurbo();
  const decoder = local.decoder;

  // get pointer to the source/encoded bit stream buffer in WASM memory
  // that can hold the encoded bitstream
  const encodedBufferInWASM = decoder.getEncodedBuffer(
    compressedImageFrame.length
  );

  // copy the encoded bitstream into WASM memory buffer
  encodedBufferInWASM.set(compressedImageFrame);

  // decode it
  decoder.decode();

  // get information about the decoded image
  const frameInfo = decoder.getFrameInfo();

  // get the decoded pixels
  const decodedPixelsInWASM = decoder.getDecodedBuffer();

  const encodedImageInfo = {
    columns: frameInfo.width,
    rows: frameInfo.height,
    bitsPerPixel: frameInfo.bitsPerSample,
    signed: imageInfo.signed,
    bytesPerPixel: imageInfo.bytesPerPixel,
    componentsPerPixel: frameInfo.componentCount,
  };

  const wasmPixelData = getPixelData(frameInfo, decodedPixelsInWASM);

  // Create an equivalent TypedArray (e.g. Int16Array)
  const pixelData = new wasmPixelData.constructor(wasmPixelData.length);

  // Copy the pixels from the WebAssembly.Memory-backed TypedArray
  // to the new one
  pixelData.set(wasmPixelData);

  // delete the instance.  Note that this frees up memory including the
  // encodedBufferInWASM and decodedPixelsInWASM invalidating them.
  // Do not use either after calling delete!
  decoder.delete();

  const encodeOptions = {
    frameInfo,
  };

  return {
    ...imageInfo,
    pixelData,
    imageInfo: encodedImageInfo,
    encodeOptions,
    ...encodeOptions,
    ...encodedImageInfo,
  };
}

function getPixelData(frameInfo, decodedBuffer) {
  if (frameInfo.isSigned) {
    return new Int8Array(
      decodedBuffer.buffer,
      decodedBuffer.byteOffset,
      decodedBuffer.byteLength
    );
  }

  return new Uint8Array(
    decodedBuffer.buffer,
    decodedBuffer.byteOffset,
    decodedBuffer.byteLength
  );
}

export default decodeAsync;
