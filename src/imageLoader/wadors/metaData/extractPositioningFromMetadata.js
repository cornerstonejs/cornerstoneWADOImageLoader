import getNumberValues from './getNumberValues.js';
import getNumberValue from './getNumberValue.js';
import getTagValue from '../getTagValue.js';
import getValue from './getValue.js';
import isNMReconstructable from '../../isNMReconstructable.js';
/**
 * Get a subpart of Image Type dicom tag defined by index
 * @param {*} metaData
 * @param {*} index 0 based index of the subtype
 */
function getImageTypeSubItemFromMetadata(metaData, index) {
  const imageType = getValue(metaData['00080008']);

  if (imageType) {
    const subTypes = imageType.split('\\');

    if (subTypes.length > index) {
      return subTypes[index];
    }
  }

  return undefined;
}
/**
 * Extracts the orientation from NM multiframe metadata, if image type
 * equal to RECON TOMO or RECON GATED TOMO
 * @param {*} metaData
 * @returns
 */
function extractOrientationFromNMMultiframeMetadata(metaData) {
  let imageOrientationPatient;
  const modality = getValue(metaData['00080060']);

  if (modality.includes('NM')) {
    const imageSubType = getImageTypeSubItemFromMetadata(metaData, 2);

    if (imageSubType && isNMReconstructable(imageSubType)) {
      const detectorInformationSequence = getTagValue(metaData['00540022']);

      if (detectorInformationSequence) {
        imageOrientationPatient = getNumberValues(
          detectorInformationSequence['00200037'],
          6
        );
      }
    }
  }

  return imageOrientationPatient;
}

/**
 * Extracts the position from NM multiframe dataset, if image type
 * equal to RECON TOMO or RECON GATED TOMO
 * @param {*} metaData
 * @returns
 */
function extractPositionFromNMMultiframeMetadata(metaData) {
  let imagePositionPatient;
  const modality = getValue(metaData['00080060']);

  if (modality.includes('NM')) {
    const imageSubType = getImageTypeSubItemFromMetadata(metaData, 2);

    if (imageSubType && isNMReconstructable(imageSubType)) {
      const detectorInformationSequence = getTagValue(metaData['00540022']);

      if (detectorInformationSequence) {
        imagePositionPatient = getNumberValues(
          detectorInformationSequence['00200032'],
          3
        );
      }
    }
  }

  return imagePositionPatient;
}

/**
 * Extract orientation information from a metadata. It tries to get the orientation
 * from the Detector Information Sequence (for NM images) if image type equal
 * to RECON TOMO or RECON GATED TOMO
 * @param {*} metaData
 * @returns
 */
function extractOrientationFromMetadata(metaData) {
  let imageOrientationPatient = getNumberValues(metaData['00200037'], 6);

  // Trying to get the orientation from the Plane Orientation Sequence
  if (!imageOrientationPatient) {
    const planeOrientationSequence = getTagValue(metaData['00209116']);

    if (planeOrientationSequence) {
      imageOrientationPatient = getNumberValues(
        planeOrientationSequence['00200037'],
        6
      );
    }
  }

  // If orientation not valid to this point, trying to get the orientation
  // from the Detector Information Sequence (for NM images) with image type
  // equal to RECON TOMO or RECON GATED TOMO

  if (!imageOrientationPatient) {
    imageOrientationPatient =
      extractOrientationFromNMMultiframeMetadata(metaData);
  }

  return imageOrientationPatient;
}

/**
 * Extract position information from a metaData. It tries to get the position
 * from the Detector Information Sequence (for NM images) if image type equal
 * to RECON TOMO or RECON GATED TOMO
 * @param {*} metaData
 * @returns
 */
function extractPositionFromMetadata(metaData) {
  let imagePositionPatient = getNumberValues(metaData['00200032'], 3);

  // Trying to get the position from the Plane Position Sequence
  if (!imagePositionPatient) {
    const planePositionSequence = getTagValue(metaData['00209113']);

    if (planePositionSequence) {
      imagePositionPatient = getNumberValues(
        planePositionSequence['00200032'],
        3
      );
    }
  }

  // If position not valid to this point, trying to get the position
  // from the Detector Information Sequence (for NM images)
  if (!imagePositionPatient) {
    imagePositionPatient = extractPositionFromNMMultiframeMetadata(metaData);
  }

  return imagePositionPatient;
}

/**
 * Extract the pixelSpacing information. If exists, extracts this information
 * from Pixel Measures Sequence
 * @param {*} metaData
 * @returns
 */
function extractSpacingFromMetadata(metaData) {
  let pixelSpacing = getNumberValues(metaData['00280030'], 2);

  // If pixelSpacing not valid to this point, trying to get the spacing
  // from the Pixel Measures Sequence
  if (!pixelSpacing) {
    const pixelMeasureSequence = getTagValue(metaData['00289110']);

    if (pixelMeasureSequence) {
      pixelSpacing = getNumberValues(pixelMeasureSequence['00280030'], 2);
    }
  }

  return pixelSpacing;
}

/**
 * Extract the sliceThickness information. If exists, extracts this information
 * from Pixel Measures Sequence
 * @param {*} metaData
 * @returns
 */
function extractSliceThicknessFromMetadata(metaData) {
  let sliceThickness;

  sliceThickness = getNumberValue(metaData['00180050']);

  if (!sliceThickness) {
    const pixelMeasureSequence = getTagValue(metaData['00289110']);

    if (pixelMeasureSequence) {
      sliceThickness = getNumberValue(pixelMeasureSequence['00180050']);
    }
  }

  return sliceThickness;
}

export {
  getImageTypeSubItemFromMetadata,
  extractOrientationFromMetadata,
  extractPositionFromMetadata,
  extractSpacingFromMetadata,
  extractSliceThicknessFromMetadata,
};
