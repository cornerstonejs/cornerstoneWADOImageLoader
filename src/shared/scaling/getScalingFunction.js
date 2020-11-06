export default function getScalingFunction(scalingParameters) {
  const { rescaleSlope, rescaleIntercept, modality } = scalingParameters;

  // TODO -> Implement other scaling functions.

  if (modality === 'PT') {
    const { patientWeight, correctedDose } = scalingParameters;
    // Pre compute as much as possible
    const patientWeightTimes1000OverCorrectedDose =
      (patientWeight * 1000) / correctedDose;

    return pixel => {
      return (
        patientWeightTimes1000OverCorrectedDose *
        (pixel * rescaleSlope + rescaleIntercept)
      );
    };
  } else {
    return pixel => {
      return pixel * rescaleSlope + rescaleIntercept;
    };
  }
}
