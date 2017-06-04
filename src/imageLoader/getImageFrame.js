import * as cornerstone from 'cornerstone-core';

/**
 * @typedef {Object} ImageFrame
 *
 * @param {Number} samplesPerPixel
 * @param {String} photometricInterpretation
 * @param {Number} planarConfiguration
 * @param {Number} rows
 * @param {Number} columns
 * @param {Number} bitsAllocated
 * @param {Number} pixelRepresentation
 * @param {Number} smallestPixelValue
 * @param {Number} largestPixelValue
 * @param {String} redPaletteColorLookupTableDescriptor
 * @param {String} greenPaletteColorLookupTableDescriptor
 * @param {String} bluePaletteColorLookupTableDescriptor
 * @param {Array} redPaletteColorLookupTableData
 * @param {Array} greenPaletteColorLookupTableData
 * @param {Array} bluePaletteColorLookupTableData
 * @param {Array} pixelData
 */

/**
 * Construct an ImageFrame object from an image's metadata
 *
 * @param imageId The image id
 * @return {ImageFrame} The image frame structure
 */
export default function (imageId) {
  const imagePixelModule = cornerstone.metaData.get('imagePixelModule', imageId);

  return {
    samplesPerPixel: imagePixelModule.samplesPerPixel,
    photometricInterpretation: imagePixelModule.photometricInterpretation,
    planarConfiguration: imagePixelModule.planarConfiguration,
    rows: imagePixelModule.rows,
    columns: imagePixelModule.columns,
    bitsAllocated: imagePixelModule.bitsAllocated,
    pixelRepresentation: imagePixelModule.pixelRepresentation, // 0 = unsigned,
    smallestPixelValue: imagePixelModule.smallestPixelValue,
    largestPixelValue: imagePixelModule.largestPixelValue,
    redPaletteColorLookupTableDescriptor: imagePixelModule.redPaletteColorLookupTableDescriptor,
    greenPaletteColorLookupTableDescriptor: imagePixelModule.greenPaletteColorLookupTableDescriptor,
    bluePaletteColorLookupTableDescriptor: imagePixelModule.bluePaletteColorLookupTableDescriptor,
    redPaletteColorLookupTableData: imagePixelModule.redPaletteColorLookupTableData,
    greenPaletteColorLookupTableData: imagePixelModule.greenPaletteColorLookupTableData,
    bluePaletteColorLookupTableData: imagePixelModule.bluePaletteColorLookupTableData,
    pixelData: undefined // populated later after decoding
  };
}
