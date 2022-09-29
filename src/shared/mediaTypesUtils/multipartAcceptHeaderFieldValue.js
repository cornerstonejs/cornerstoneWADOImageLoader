import assertMediaTypeIsValid from './assertMediaTypeIsValid.js';
import { mediaTypes } from './mediaTypes.js';

/**
 * Builds an accept header field value for HTTP GET multipart request messages.
 *
 * Takes in input a media types array of type [{mediaType, transferSyntaxUID}, ... ]
 * and finally composes a string for the accept header field value as in example below:
 *
 * "multipart/related; type="image/x-dicom-rle"; transfer-syntax=1.2.840.10008.1.2.5,
 *  multipart/related; type="image/jpeg"; transfer-syntax=1.2.840.10008.1.2.4.50,
 *  multipart/related; type="application/octet-stream"; transfer-syntax=*"
 *
 * NOTE: the xhr request will try to fetch with all the transfer-syntax syntaxes
 * specified in the accept header field value in descending order.
 * The first element ("image/x-dicom-rle" in this example) has the highest priority.
 *
 * @param {Array} mediaTypes Acceptable media types
 *
 * @returns {string} accept header field value
 */

export default function buildMultipartAcceptHeaderFieldValue(mediaTypes) {
  if (!Array.isArray(mediaTypes)) {
    throw new Error('Acceptable media types must be provided as an Array');
  }

  const fieldValueParts = [];

  mediaTypes.forEach((item) => {
    const { transferSyntaxUID, mediaType } = item;

    assertMediaTypeIsValid(mediaType);

    let fieldValue = `multipart/related; type="${mediaType}"`;

    if (transferSyntaxUID) {
      fieldValue += `; transfer-syntax=${transferSyntaxUID}`;
    }

    fieldValueParts.push(fieldValue);
  });

  return fieldValueParts.join(', ');
}

const multipartAcceptHeaderFieldValue =
  buildMultipartAcceptHeaderFieldValue(mediaTypes);

export { multipartAcceptHeaderFieldValue };
