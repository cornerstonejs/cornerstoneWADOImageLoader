function getNumberValues (dataSet, tag, minimumLength) {
  const values = [];
  let valueAsString = dataSet.string(tag);

  if (!valueAsString) {
    return;
  }

  valueAsString = valueAsString.replace('\\\\', '\\');
  const split = valueAsString.split('\\');

  if (minimumLength && split.length < minimumLength) {
    return;
  }
  for (let i = 0; i < split.length; i++) {
    values.push(parseFloat(split[i]));
  }

  return values;
}

export default getNumberValues;
