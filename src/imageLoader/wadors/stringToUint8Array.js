/**
 * Convert a string to a Uint8Array
 *
 * @param {String} str An input string
 * @return {Uint8Array} The string converted to a Uint8Array
 */
export default function (str) {
  const uint = new Uint8Array(str.length);

  for (let i = 0, j = str.length; i < j; i++) {
    uint[i] = str.charCodeAt(i);
  }

  return uint;
}