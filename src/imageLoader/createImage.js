import $ from 'jquery';
import getImageFrame from './getImageFrame';
import decodeImageFrame from './decodeImageFrame';
import isColorImageFn from './isColorImage';
import convertColorSpace from './convertColorSpace';
import getMinMax from './getMinMax';
import isJPEGBaseline8BitColor from './isJPEGBaseline8BitColor';
import * as cornerstone from 'cornerstone-core';

let lastImageIdDrawn = '';

/**
 * Check whether the modality LUT is meant to be used for display purposes
 * For XA and XRF images, the modality LUT is not meant to be used.
 *
 * See https://groups.google.com/forum/#!searchin/comp.protocols.dicom/Modality$20LUT$20XA/comp.protocols.dicom/UBxhOZ2anJ0/D0R_QP8V2wIJ
 *
 * @param {String} sopClassUid
 * @return {boolean} Whether or not the Modality LUT should be used for image display
 */
function isModalityLUTForDisplay (sopClassUid) {
  return sopClassUid !== '1.2.840.10008.5.1.4.1.1.12.1' && // XA
         sopClassUid !== '1.2.840.10008.5.1.4.1.1.12.2.1'; // XRF
}

/**
 * Helper function to set pixel data to the right typed array.  This is needed because web workers
 * can transfer array buffers but not typed arrays
 * @param imageFrame
 */
function setPixelDataType (imageFrame) {
  if (imageFrame.bitsAllocated === 16) {
    if (imageFrame.pixelRepresentation === 0) {
      imageFrame.pixelData = new Uint16Array(imageFrame.pixelData);
    } else {
      imageFrame.pixelData = new Int16Array(imageFrame.pixelData);
    }
  } else {
    imageFrame.pixelData = new Uint8Array(imageFrame.pixelData);
  }
}

/**
 * Create an Image
 *
 * @param {String} imageId
 * @param {Array} pixelData
 * @param {String} transferSyntax
 * @param {Object} options
 *
 * @returns {Promise}
 */
export default function (imageId, pixelData, transferSyntax, options) {
  const canvas = document.createElement('canvas');
  const deferred = $.Deferred();
  const imageFrame = getImageFrame(imageId);
  const decodePromise = decodeImageFrame(imageFrame, transferSyntax, pixelData, canvas, options);

  decodePromise.then(function (imageFrame) {
    // var imagePixelModule = metaDataProvider('imagePixelModule', imageId);
    const imagePlaneModule = cornerstone.metaData.get('imagePlaneModule', imageId) || {};
    const voiLutModule = cornerstone.metaData.get('voiLutModule', imageId) || {};
    const modalityLutModule = cornerstone.metaData.get('modalityLutModule', imageId) || {};
    const sopCommonModule = cornerstone.metaData.get('sopCommonModule', imageId) || {};
    const color = isColorImageFn(imageFrame.photometricInterpretation);

    // JPEGBaseline (8 bits) is already returning the pixel data in the right format (rgba)
    // because it's using a canvas to load and decode images.
    if (!isJPEGBaseline8BitColor(imageFrame, transferSyntax)) {
      setPixelDataType(imageFrame);

      // convert color space
      if (color) {
        // setup the canvas context
        canvas.height = imageFrame.rows;
        canvas.width = imageFrame.columns;

        const context = canvas.getContext('2d');
        const imageData = context.createImageData(imageFrame.columns, imageFrame.rows);

        convertColorSpace(imageFrame, imageData);
        imageFrame.imageData = imageData;
        imageFrame.pixelData = imageData.data;

        // calculate smallest and largest PixelValue of the converted pixelData
        const minMax = getMinMax(imageFrame.pixelData);

        imageFrame.smallestPixelValue = minMax.min;
        imageFrame.largestPixelValue = minMax.max;
      }
    }

    const image = {
      imageId,
      color,
      columns: imageFrame.columns,
      rows: imageFrame.rows,
      width: imageFrame.columns,
      height: imageFrame.rows,
      intercept: modalityLutModule.rescaleIntercept || 0,
      slope: modalityLutModule.rescaleSlope || 1,
      invert: imageFrame.photometricInterpretation === 'MONOCHROME1',
      minPixelValue: imageFrame.smallestPixelValue,
      maxPixelValue: imageFrame.largestPixelValue,
      render: undefined, // set below
      sizeInBytes: imageFrame.pixelData.length,
      rowPixelSpacing: imagePlaneModule.pixelSpacing ? imagePlaneModule.pixelSpacing[0] : undefined,
      columnPixelSpacing: imagePlaneModule.pixelSpacing ? imagePlaneModule.pixelSpacing[1] : undefined,
      windowCenter: voiLutModule.windowCenter ? voiLutModule.windowCenter[0] : undefined,
      windowWidth: voiLutModule.windowWidth ? voiLutModule.windowWidth[0] : undefined,
      decodeTimeInMS: imageFrame.decodeTimeInMS
    };

    // add function to return pixel data
    image.getPixelData = () => imageFrame.pixelData;

    // Setup the renderer
    if (image.color) {
      image.render = cornerstone.renderColorImage;
      image.getCanvas = function () {
        if (lastImageIdDrawn === imageId) {
          return canvas;
        }

        canvas.height = image.rows;
        canvas.width = image.columns;
        const context = canvas.getContext('2d');

        context.putImageData(imageFrame.imageData, 0, 0);
        lastImageIdDrawn = imageId;

        return canvas;
      };

    } else {
      image.render = cornerstone.renderGrayscaleImage;
    }

    // Modality LUT
    if (modalityLutModule.modalityLUTSequence &&
      modalityLutModule.modalityLUTSequence.length > 0 &&
      isModalityLUTForDisplay(sopCommonModule.sopClassUID)) {
      image.modalityLUT = modalityLutModule.modalityLUTSequence[0];
    }

    // VOI LUT
    if (voiLutModule.voiLUTSequence &&
      voiLutModule.voiLUTSequence.length > 0) {
      image.voiLUT = voiLutModule.voiLUTSequence[0];
    }

    // set the ww/wc to cover the dynamic range of the image if no values are supplied
    if (image.windowCenter === undefined || image.windowWidth === undefined) {
      if (image.color) {
        image.windowWidth = 255;
        image.windowCenter = 128;
      } else {
        const maxVoi = image.maxPixelValue * image.slope + image.intercept;
        const minVoi = image.minPixelValue * image.slope + image.intercept;

        image.windowWidth = maxVoi - minVoi;
        image.windowCenter = (maxVoi + minVoi) / 2;
      }
    }
    deferred.resolve(image);
  });

  return deferred.promise();
}
