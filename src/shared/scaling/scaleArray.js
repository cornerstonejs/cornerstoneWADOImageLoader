export default function scaleArray(array, scalingParameters) {
  const arrayLength = array.length;

  if (scalingParameters.modality === 'PT') {
    const { rescaleSlope, rescaleIntercept, suvFactor } = scalingParameters;

    for (let i = 0; i < arrayLength; i++) {
      array[i] = suvFactor * (array[i] * rescaleSlope + rescaleIntercept);
    }
  } else {
    const { rescaleSlope, rescaleIntercept } = scalingParameters;

    for (let i = 0; i < arrayLength; i++) {
      array[i] = array[i] * rescaleSlope + rescaleIntercept;
    }
  }
}
