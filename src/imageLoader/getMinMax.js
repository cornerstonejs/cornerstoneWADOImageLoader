/**
 * Calculate the minimum and maximum pixel values in the input
 * pixel data array
 *
 * @param storedPixelData
 * @return {{min: Number, max: Number}} Minimum and maximum values in the input array
 */
export default function (storedPixelData) {
  let min = storedPixelData[0];
  let max = storedPixelData[0];
  const numPixels = storedPixelData.length;

  for (let index = 0; index < numPixels; index++) {
    const storedPixel = storedPixelData[index];

    min = Math.min(min, storedPixel);
    max = Math.max(max, storedPixel);
  }

  return {
    min,
    max
  };
}
