import unpackBinaryFrame from './unpackBinaryFrame.js';

/**
 * Function to deal with extracting an image frame from an encapsulated data set.
 */
<<<<<<< HEAD
(function ($, cornerstone, cornerstoneWADOImageLoader) {

  "use strict";

  function getUncompressedImageFrame(dataSet, frameIndex) {
    var pixelDataElement = dataSet.elements.x7fe00010;
    if (!pixelDataElement || pixelDataElement.length===0) throw 'missing pixel data';

    var bitsAllocated = dataSet.uint16('x00280100');
    var rows = dataSet.uint16('x00280010');
    var columns = dataSet.uint16('x00280011');
    var samplesPerPixel = dataSet.uint16('x00280002');

    var pixelDataOffset = pixelDataElement.dataOffset;
    var pixelsPerFrame = rows * columns * samplesPerPixel;

    var frameOffset;
    if(bitsAllocated === 8) {
      frameOffset = pixelDataOffset + frameIndex * pixelsPerFrame;
      if(frameOffset >= dataSet.byteArray.length) {
        throw 'frame exceeds size of pixelData';
      }
      return new Uint8Array(dataSet.byteArray.buffer, frameOffset, pixelsPerFrame);
=======

function getUncompressedImageFrame (dataSet, frameIndex) {
  const pixelDataElement = dataSet.elements.x7fe00010;
  const bitsAllocated = dataSet.uint16('x00280100');
  const rows = dataSet.uint16('x00280010');
  const columns = dataSet.uint16('x00280011');
  const samplesPerPixel = dataSet.uint16('x00280002');

  const pixelDataOffset = pixelDataElement.dataOffset;
  const pixelsPerFrame = rows * columns * samplesPerPixel;

  let frameOffset;

  if (bitsAllocated === 8) {
    frameOffset = pixelDataOffset + frameIndex * pixelsPerFrame;
    if (frameOffset >= dataSet.byteArray.length) {
      throw 'frame exceeds size of pixelData';
>>>>>>> 513d868f9e5b0698b63bc72b930962884a9c9276
    }

    return new Uint8Array(dataSet.byteArray.buffer, frameOffset, pixelsPerFrame);
  } else if (bitsAllocated === 16) {
    frameOffset = pixelDataOffset + frameIndex * pixelsPerFrame * 2;
    if (frameOffset >= dataSet.byteArray.length) {
      throw 'frame exceeds size of pixelData';
    }

    return new Uint8Array(dataSet.byteArray.buffer, frameOffset, pixelsPerFrame * 2);
  } else if (bitsAllocated === 1) {
    frameOffset = pixelDataOffset + frameIndex * pixelsPerFrame * 0.125;
    if (frameOffset >= dataSet.byteArray.length) {
      throw 'frame exceeds size of pixelData';
    }

    return unpackBinaryFrame(dataSet.byteArray, frameOffset, pixelsPerFrame);
  }

<<<<<<< HEAD
  cornerstoneWADOImageLoader.wadouri.getUncompressedImageFrame = getUncompressedImageFrame;
}($, cornerstone, cornerstoneWADOImageLoader));
=======
  throw 'unsupported pixel format';
}

export default getUncompressedImageFrame;
>>>>>>> 513d868f9e5b0698b63bc72b930962884a9c9276
