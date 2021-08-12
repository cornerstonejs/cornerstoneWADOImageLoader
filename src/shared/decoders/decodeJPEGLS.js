import charlsFactory from '@cornerstonejs/codec-charls/dist/charlswasm.js';

// Webpack asset/resource copies this to our output folder
import charlsWasm from '@cornerstonejs/codec-charls/dist/charlswasm.wasm';

const local = {
  codec: undefined,
  decoder: undefined,
  encoder: undefined,
};

async function initCharls() {
  if (local.codec) {
    return Promise.resolve();
  }

  const charlsModule = charlsFactory({
    locateFile: f => {
      if (f.endsWith('.wasm')) {
        return charlsWasm;
      }

      return f;
    },
  });

  charlsModule.onRuntimeInitialized = evt => {
    console.log('runtime initialized...');
    console.log(evt);
  };

  return new Promise((resolve, reject) => {
    charlsModule.then(instance => {
      local.codec = instance;
      local.decoder = new instance.JpegLSDecoder();
      local.encoder = new instance.JpegLSEncoder();
      resolve();
    }, reject);
  });
}

/**
 *
 * @param {*} compressedImageFrame
 * @param {object}  imageInfo
 * @param {boolean} imageInfo.signed - (pixelRepresentation === 1)
 */
async function decodeAsync(compressedImageFrame, imageInfo) {
  await initCharls();
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
  const interleaveMode = decoder.getInterleaveMode();
  const nearLossless = decoder.getNearLossless();

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

  // The returned TypedArray here
  // has a view on the WebAssembly.Memory
  // itself. This cannot be copied back from the Worker
  // to the main thread. We must create another TypedArray
  // and copy it there before sending it back.
  const wasmPixelData = getPixelData(
    frameInfo,
    decodedPixelsInWASM,
    imageInfo.signed
  );

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
    nearLossless,
    interleaveMode,
    frameInfo,
  };

  return {
    ...imageInfo,
    // shim
    pixelData,
    // end shim
    imageInfo: encodedImageInfo,
    encodeOptions,
    ...encodeOptions,
    ...encodedImageInfo,
  };
}

function getPixelData(frameInfo, decodedBuffer, signed) {
  if (frameInfo.bitsPerSample > 8) {
    if (signed) {
      return new Int16Array(
        decodedBuffer.buffer,
        decodedBuffer.byteOffset,
        decodedBuffer.byteLength / 2
      );
    } else {
      return new Uint16Array(
        decodedBuffer.buffer,
        decodedBuffer.byteOffset,
        decodedBuffer.byteLength / 2
      );
    }
  }

  if (signed) {
    return new Int8Array(
      decodedBuffer.buffer,
      decodedBuffer.byteOffset,
      decodedBuffer.byteLength
    );
  } else {
    return new Uint8Array(
      decodedBuffer.buffer,
      decodedBuffer.byteOffset,
      decodedBuffer.byteLength
    );
  }
}

export default decodeAsync;
