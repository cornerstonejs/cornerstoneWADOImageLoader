/**
 * Convert a Uint8Array to a String
 *
 * @param {Uint8Array} data
 * @param {Number} offset
 * @param {Number} length
 * 
 * @return {string} The Uint8Array converted to a String
 */
export default function (data, offset, length) {
  offset = offset || 0;
  length = length || data.length - offset;
  let str = '';

  for (let i = offset; i < offset + length; i++) {
    str += String.fromCharCode(data[i]);
  }

  return str;
}