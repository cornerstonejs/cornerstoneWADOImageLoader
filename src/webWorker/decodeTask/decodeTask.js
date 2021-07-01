// import { initializeJPEG2000 } from '../../shared/decoders/decodeJPEG2000.js';
// import { initializeJPEGLS } from '../../shared/decoders/decodeJPEGLS.js';
import { loadDecoders } from '../../externalDecoders.js';
import calculateMinMax from '../../shared/calculateMinMax.js';
import decodeImageFrame from '../../shared/decodeImageFrame.js';

// the configuration object for the decodeTask
let decodeConfig;

/**
 * Function to control loading and initializing the codecs
 * @param config
 */
function loadCodecs(config) {
  return loadDecoders(config.decodeTask.decoderPaths).then(decoders => {
    const { decodeJPEG2000, decodeJPEGLS } = decoders;

    // Initialize the codecs
    if (config.decodeTask.initializeCodecsOnStartup) {
      if (decodeJPEG2000) {
        decodeJPEG2000.initialize(config.decodeTask);
      }
      if (decodeJPEGLS) {
        decodeJPEGLS.initialize(config.decodeTask);
      }
    }
  });
}

/**
 * Task initialization function
 */
function initialize(config) {
  decodeConfig = config;

  return loadCodecs(config);
}

/**
 * Task handler function
 */
function handler(data, doneCallback) {
  // Load the codecs if they aren't already loaded
  loadCodecs(decodeConfig).then(() => {
    const strict =
      decodeConfig && decodeConfig.decodeTask && decodeConfig.decodeTask.strict;
    const imageFrame = data.data.imageFrame;

    // convert pixel data from ArrayBuffer to Uint8Array since web workers support passing ArrayBuffers but
    // not typed arrays
    const pixelData = new Uint8Array(data.data.pixelData);

    decodeImageFrame(
      imageFrame,
      data.data.transferSyntax,
      pixelData,
      decodeConfig.decodeTask,
      data.data.options
    ).then(decodedImageFrame => {
      if (!decodedImageFrame.pixelData) {
        throw new Error(
          'decodeTask: imageFrame.pixelData is undefined after decoding'
        );
      }

      calculateMinMax(decodedImageFrame, strict);

      // convert from TypedArray to ArrayBuffer since web workers support passing ArrayBuffers but not
      // typed arrays
      decodedImageFrame.pixelData = decodedImageFrame.pixelData.buffer;

      // invoke the callback with our result and pass the pixelData in the transferList to move it to
      // UI thread without making a copy
      doneCallback(decodedImageFrame, [decodedImageFrame.pixelData]);
    });
  });
}

export default {
  taskType: 'decodeTask',
  handler,
  initialize,
};
