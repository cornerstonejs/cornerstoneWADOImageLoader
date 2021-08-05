// https://emscripten.org/docs/api_reference/module.html
import openJpegFactory from '@cornerstonejs/codec-openjpeg/dist/openjpegwasm.js';

const local = {
  codec: undefined,
  decoder: undefined,
  encoder: undefined,
};

async function initOpenJpeg() {
  if (local.codec) {
    return Promise.resolve();
  }

  const openJpegModule = openJpegFactory();

  openJpegModule.onRuntimeInitialized = evt => {
    console.log('runtime initialized...');
    console.log(evt);
  };

  return new Promise((resolve, reject) => {
    openJpegModule.then(instance => {
      local.codec = instance;
      local.decoder = new instance.J2KDecoder();
      local.encoder = new instance.J2KEncoder();
      resolve();
    }, reject);
  });
}

// https://github.com/chafey/openjpegjs/blob/master/test/browser/index.html
async function decodeAsync(compressedImageFrame, imageInfo) {
  await initOpenJpeg();
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
  // decoder.decodeSubResolution(decodeLevel, decodeLayer);
  // const resolutionAtLevel = decoder.calculateSizeAtDecompositionLevel(decodeLevel);

  // get information about the decoded image
  const frameInfo = decoder.getFrameInfo();
  // get the decoded pixels
  const decodedBufferInWASM = decoder.getDecodedBuffer();
  const imageFrame = new Uint8Array(decodedBufferInWASM.length);

  imageFrame.set(decodedBufferInWASM);

  const imageOffset = `x: ${decoder.getImageOffset().x}, y: ${
    decoder.getImageOffset().y
  }`;
  const numDecompositions = decoder.getNumDecompositions();
  const numLayers = decoder.getNumLayers();
  const progessionOrder = ['unknown', 'LRCP', 'RLCP', 'RPCL', 'PCRL', 'CPRL'][
    decoder.getProgressionOrder() + 1
  ];
  const reversible = decoder.getIsReversible();
  const blockDimensions = `${decoder.getBlockDimensions().width} x ${
    decoder.getBlockDimensions().height
  }`;
  const tileSize = `${decoder.getTileSize().width} x ${
    decoder.getTileSize().height
  }`;
  const tileOffset = `${decoder.getTileOffset().x}, ${
    decoder.getTileOffset().y
  }`;
  const colorTransform = decoder.getColorSpace();

  // ~~ Not part of this codec's API?
  // const interleaveMode = decoder.getInterleaveMode();
  // const nearLossless = decoder.getNearLossless();

  const decodedSize = `${decodedBufferInWASM.length.toLocaleString()} bytes`;
  // const compressionRatio = `${(decodedBufferInWASM.length /encodedBitStream.length).toFixed(2)}:1`;

  const encodedImageInfo = {
    columns: frameInfo.width,
    rows: frameInfo.height,
    bitsPerPixel: frameInfo.bitsPerSample,
    signed: frameInfo.isSigned,
    bytesPerPixel: imageInfo.bytesPerPixel,
    componentsPerPixel: frameInfo.componentCount,
  };
  const pixelData = getPixelData(frameInfo, decodedBufferInWASM);

  const encodeOptions = {};

  // We're returning a promise that resolves...
  // return {
  //   imageFrame,
  //   imageInfo,
  //   encodeOptions: {},
  // };

  return {
    ...imageInfo,
    // imageFrame,
    // shim
    pixelData,
    // end shim
    imageInfo: encodedImageInfo,
    encodeOptions,
    ...encodeOptions,
    ...encodedImageInfo,
  };
}

function getPixelData(frameInfo, decodedBuffer) {
  if (frameInfo.bitsPerSample > 8) {
    if (frameInfo.isSigned) {
      return new Int16Array(
        decodedBuffer.buffer,
        decodedBuffer.byteOffset,
        decodedBuffer.byteLength / 2
      );
    }

    return new Uint16Array(
      decodedBuffer.buffer,
      decodedBuffer.byteOffset,
      decodedBuffer.byteLength / 2
    );
  }

  return decodedBuffer;
}

export default decodeAsync;
