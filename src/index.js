import {
  convertRGBColorByPixel,
  convertRGBColorByPlane,
  convertYBRFullByPixel,
  convertYBRFullByPlane,
  convertPALETTECOLOR,
} from './imageLoader/colorSpaceConverters/index.js';

import { default as wadouri } from './imageLoader/wadouri/index.js';
import { default as wadors } from './imageLoader/wadors/index.js';
import { default as configure } from './imageLoader/configure.js';
import { default as convertColorSpace } from './imageLoader/convertColorSpace.js';
import { default as createImage } from './imageLoader/createImage.js';
import { default as decodeImageFrame } from './imageLoader/decodeImageFrame.js';
import { default as decodeJPEGBaseline8BitColor } from './imageLoader/decodeJPEGBaseline8BitColor.js';
import { default as getImageFrame } from './imageLoader/getImageFrame.js';
// import { default as getMinMax } from '../shared/getMinMax.js';
import { default as isColorImage } from './imageLoader/isColorImage.js';
import { default as isJPEGBaseline8BitColor } from './imageLoader/isJPEGBaseline8BitColor.js';
import { default as webWorkerManager } from './imageLoader/webWorkerManager.js';
// import { default as version } from '../version.js';
import { internal } from './imageLoader/internal/index.js';
import { default as external } from './externalModules.js';

const cornerstoneWADOImageLoader = {
  convertRGBColorByPixel,
  convertRGBColorByPlane,
  convertYBRFullByPixel,
  convertYBRFullByPlane,
  convertPALETTECOLOR,
  wadouri,
  wadors,
  configure,
  convertColorSpace,
  createImage,
  decodeImageFrame,
  decodeJPEGBaseline8BitColor,
  getImageFrame,
  // getMinMax,
  isColorImage,
  isJPEGBaseline8BitColor,
  webWorkerManager,
  // version,
  internal,
  external,
};

export {
  convertRGBColorByPixel,
  convertRGBColorByPlane,
  convertYBRFullByPixel,
  convertYBRFullByPlane,
  convertPALETTECOLOR,
  wadouri,
  wadors,
  configure,
  convertColorSpace,
  createImage,
  decodeImageFrame,
  decodeJPEGBaseline8BitColor,
  getImageFrame,
  // getMinMax,
  isColorImage,
  isJPEGBaseline8BitColor,
  webWorkerManager,
  // version,
  internal,
  external,
};

export default cornerstoneWADOImageLoader;
