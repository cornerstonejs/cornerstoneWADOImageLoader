/**
 * Returns the values as an array of numbers
 *
 * @param element - The javascript object for the specified element in the metadata
 * @param {Number} [minimumLength] - the minimum number of values
 * @returns {Array|Undefined}
 */
export default function (element, minimumLength) {
  if (!element) {
    return;
  }
  // Value is not present if the attribute has a zero length value
  if (!element.Value) {
    return;
  }
  // make sure we have the expected length
  if (minimumLength && element.Value.length < minimumLength) {
    return;
  }

  const values = [];

  for (let i = 0; i < element.Value.length; i++) {
    values.push(parseFloat(element.Value[i]));
  }

  return values;
}
