/* eslint no-bitwise: 0 */

function convertLUTto8Bit(lut, shift) {
  const numEntries = lut.length;
  const cleanedLUT = new Uint8ClampedArray(numEntries);

  for (let i = 0; i < numEntries; ++i) {
    cleanedLUT[i] = lut[i] >> shift;
  }

  return cleanedLUT;
}

/**
 * Convert pixel data with PALETTE COLOR Photometric Interpretation to RGBA
 *
 * @param {ImageFrame} imageFrame
 * @param {Uint8ClampedArray} rgbaBuffer
 * @returns {rgbaBuffer} as async function
 */
export default async function (imageFrame, rgbaBuffer) {
  const numPixels = imageFrame.columns * imageFrame.rows;
  const pixelData = imageFrame.pixelData;
  const [rData, gData, bData] = await Promise.all([
    imageFrame.redPaletteColorLookupTableData,
    imageFrame.greenPaletteColorLookupTableData,
    imageFrame.bluePaletteColorLookupTableData,
  ]);

  if (!rData || !gData || !bData) {
    throw new Error(`Palette data not found in ${imageFrame}`);
  }

  const len = imageFrame.redPaletteColorLookupTableData.length;

  let palIndex = 0;

  let rgbaIndex = 0;

  const start = imageFrame.redPaletteColorLookupTableDescriptor[1];
  const shift =
    imageFrame.redPaletteColorLookupTableDescriptor[2] === 8 ? 0 : 8;

  const rDataCleaned = convertLUTto8Bit(rData, shift);
  const gDataCleaned = convertLUTto8Bit(gData, shift);
  const bDataCleaned = convertLUTto8Bit(bData, shift);

  for (let i = 0; i < numPixels; ++i) {
    let value = pixelData[palIndex++];

    if (value < start) {
      value = 0;
    } else if (value > start + len - 1) {
      value = len - 1;
    } else {
      value -= start;
    }

    rgbaBuffer[rgbaIndex++] = rDataCleaned[value];
    rgbaBuffer[rgbaIndex++] = gDataCleaned[value];
    rgbaBuffer[rgbaIndex++] = bDataCleaned[value];
    rgbaBuffer[rgbaIndex++] = 255;
  }

  return rgbaBuffer;
}
