/* eslint no-bitwise: 0 */

/**
 * Check whether a bit position is set inside a byte
 *
 * @param {Number} byte The input byte
 * @param {Number} bitPos The bit position
 * @return {Boolean} Whether or not the bit is set
 */
function isBitSet (byte, bitPos) {
  return Boolean(byte & (1 << bitPos));
}

/**
 * Function to deal with unpacking a binary frame
 *
 * @param byteArray
 * @param {Number} frameOffset
 * @param pixelsPerFrame
 *
 * @return {Uint8Array}
 */
export default function (byteArray, frameOffset, pixelsPerFrame) {
  // Create a new pixel array given the image size
  const pixelData = new Uint8Array(pixelsPerFrame);

  for (let i = 0; i < pixelsPerFrame; i++) {
    // Compute byte position
    const bytePos = Math.floor(i / 8);

    // Get the current byte
    const byte = byteArray[bytePos + frameOffset];

    // Bit position (0-7) within byte
    const bitPos = (i % 8);

    // Check whether bit at bitpos is set
    pixelData[i] = isBitSet(byte, bitPos) ? 1 : 0;
  }

  return pixelData;
}
