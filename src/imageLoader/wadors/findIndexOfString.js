import stringToUint8Array from './stringToUint8Array';

/**
 * checkToken
 *
 * @param token
 * @param data
 * @param dataOffset
 * @return {boolean}
 */
function checkToken (token, data, dataOffset) {
  if (dataOffset + token.length > data.length) {
    return false;
  }

  let endIndex = dataOffset;

  for (let i = 0; i < token.length; i++) {
    if (token[i] !== data[endIndex++]) {
      return false;
    }
  }

  return true;
}

/**
 *
 * @param data
 * @param str
 * @param offset
 * @return {*}
 */
export default function findIndexOfString (data, str, offset) {

  offset = offset || 0;

  const token = stringToUint8Array(str);

  for (let i = offset; i < data.length; i++) {
    if (token[0] === data[i]) {
      // console.log('match @', i);
      if (checkToken(token, data, i)) {
        return i;
      }
    }
  }

  return -1;
}
