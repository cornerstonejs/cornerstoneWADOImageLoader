/**
 * Returns the raw value
 *
 * @param element - The javascript object for the specified element in the metadata
 * @param {Number} [index] - the index of the value in a multi-valued element, default is 0
 * @param {*} [defaultValue] - The default value to return if the element does not exist
 * @returns {*}
 */
export default function (element, index = 0, defaultValue) {
  if (!element) {
    return defaultValue;
  }
  // Value is not present if the attribute has a zero length value
  if (!element.Value) {
    return defaultValue;
  }
  // make sure we have the specified index
  if (element.Value.length <= index) {
    return defaultValue;
  }

  return element.Value[index];
}
