import getValue from './getValue';

/**
 *
 * @param element
 * @param {Number} index
 * @return {Number|Undefined}
 */
export default function (element, index) {
  const value = getValue(element, index);

  if (value === undefined) {
    return;
  }

  return parseFloat(value);
}
