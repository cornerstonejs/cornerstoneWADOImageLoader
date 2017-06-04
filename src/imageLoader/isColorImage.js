/**
 * Check whether the photometric interpretation value for an image
 * represents a color image.
 *
 * @param {String} photometricInterpretation The Photometric Interpretation value
 * @return {boolean} Whether or not this is a color data type
 */
export default function (photometricInterpretation) {
  return (photometricInterpretation === 'RGB' ||
    photometricInterpretation === 'PALETTE COLOR' ||
    photometricInterpretation === 'YBR_FULL' ||
    photometricInterpretation === 'YBR_FULL_422' ||
    photometricInterpretation === 'YBR_PARTIAL_422' ||
    photometricInterpretation === 'YBR_PARTIAL_420' ||
    photometricInterpretation === 'YBR_RCT' ||
    photometricInterpretation === 'YBR_ICT');
}
