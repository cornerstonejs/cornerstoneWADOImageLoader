export default function scaleArray(
  imageFrame,
  preScaleOptions,
  array,
  scalingParameters
) {
  const arrayLength = array.length;
  const rescaleSlope = scalingParameters?.rescaleSlope || 1;
  const rescaleIntercept = scalingParameters?.rescaleIntercept || 0;
  const suvbw = scalingParameters?.suvbw || 1;

  let isNegative = false;

  if (scalingParameters.modality === 'PT') {
    if (typeof suvbw !== 'number') {
      return;
    }

    for (let i = 0; i < arrayLength; i++) {
      const value = suvbw * (array[i] * rescaleSlope + rescaleIntercept);

      array[i] = value;
      if (value < 0 && !isNegative) {
        isNegative = true;
      }
    }
  } else {
    for (let i = 0; i < arrayLength; i++) {
      const value = array[i] * rescaleSlope + rescaleIntercept;

      array[i] = value;
      if (value < 0 && !isNegative) {
        isNegative = true;
      }
    }
  }

  imageFrame.preScale = {
    ...preScaleOptions,
    scaled: true,
    isNegative,
  };

  return true;
}
