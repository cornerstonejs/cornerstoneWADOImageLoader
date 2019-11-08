import { getOptions } from './../internal/options.js';

// TODO: Find a way to allow useWebWorkers: false that doesn't make the main bundle huge
import { default as decodeImageFrameHandler } from './../../shared/decodeImageFrame.js';
import calculateMinMax from './../../shared/calculateMinMax.js';
import { initializeJPEG2000 } from './../../shared/decoders/decodeJPEG2000.js';
import { initializeJPEGLS } from './../../shared/decoders/decodeJPEGLS.js';

let codecsInitialized = false;

/**
 *
 * @param {*} imageFrame
 * @param {*} transferSyntax
 * @param {*} pixelData
 * @param {*} canvas
 * @param {object} [options={}]
 * @param {bool} [options.priority]
 */
export default function _decodeOnMainThread(
  imageFrame,
  transferSyntax,
  pixelData,
  canvas,
  options = {}
) {
  const { strict, decodeConfig } = getOptions();

  // Note: May cause issues
  if (codecsInitialized === false) {
    initializeJPEG2000(decodeConfig);
    initializeJPEGLS(decodeConfig);
    codecsInitialized = true;
  }

  return new Promise((resolve, reject) => {
    try {
      const decodeArguments = [
        imageFrame,
        transferSyntax,
        pixelData,
        decodeConfig,
        options,
      ];
      const decodedImageFrame = decodeImageFrameHandler(...decodeArguments);

      calculateMinMax(decodedImageFrame, strict);
      resolve(decodedImageFrame);
    } catch (error) {
      reject(error);
    }
  });
}
