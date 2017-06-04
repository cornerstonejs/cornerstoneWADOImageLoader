import { convertRGBColorByPixel, convertRGBColorByPlane,
         convertYBRFullByPixel, convertYBRFullByPlane,
         convertPALETTECOLOR } from './colorSpaceConverters';

/**
 * Convert an array from RGB color space to RGBA
 *
 * @param {ImageFrame} imageFrame
 * @param {CanvasPixelArray} rgbaBuffer
 */
function convertRGB (imageFrame, rgbaBuffer) {
  if (imageFrame.planarConfiguration === 0) {
    convertRGBColorByPixel(imageFrame.pixelData, rgbaBuffer);
  } else {
    convertRGBColorByPlane(imageFrame.pixelData, rgbaBuffer);
  }
}

/**
 * Convert an array from YBRFull color space to RGBA
 *
 * @param {ImageFrame} imageFrame
 * @param {CanvasPixelArray} rgbaBuffer
 */
function convertYBRFull (imageFrame, rgbaBuffer) {
  if (imageFrame.planarConfiguration === 0) {
    convertYBRFullByPixel(imageFrame.pixelData, rgbaBuffer);
  } else {
    convertYBRFullByPlane(imageFrame.pixelData, rgbaBuffer);
  }
}

/**
 * Convert the pixel data from the input color space to RGBA
 * based on the photometric interpretation of the image frame.
 *
 * @param {ImageFrame} imageFrame
 * @param {ImageData} imageData
 * @throws If the PhotometricInterpretation has no known color space conversion approach
 */
export default function convertColorSpace (imageFrame, imageData) {
  const rgbaBuffer = imageData.data;
  const photometricInterpretation = imageFrame.photometricInterpretation;

  if (photometricInterpretation === 'RGB') {
    convertRGB(imageFrame, rgbaBuffer);
  } else if (photometricInterpretation === 'YBR_RCT') {
    convertRGB(imageFrame, rgbaBuffer);
  } else if (photometricInterpretation === 'YBR_ICT') {
    convertRGB(imageFrame, rgbaBuffer);
  } else if (photometricInterpretation === 'PALETTE COLOR') {
    convertPALETTECOLOR(imageFrame, rgbaBuffer);
  } else if (photometricInterpretation === 'YBR_FULL_422') {
    convertRGB(imageFrame, rgbaBuffer);
  } else if (photometricInterpretation === 'YBR_FULL') {
    convertYBRFull(imageFrame, rgbaBuffer);
  } else {
    throw new Error(`No color space conversion for photometric interpretation ${photometricInterpretation}`);
  }
}
