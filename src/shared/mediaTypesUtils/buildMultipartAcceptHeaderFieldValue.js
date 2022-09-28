import assertMediaTypeIsValid from './assertMediaTypeIsValid.js';

/**
 * Builds an accept header field value for HTTP GET multipart request messages.
 *
 * Takes in input a media types array of type [{mediaType, transferSyntaxUID}, ... ],
 * cross-compares with a map defining the supported media types per transferSyntaxUID
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
 * @param {Object} supportedMediaTypes Supported media types
 *
 * @returns {string} accept header field value
 */

export default function buildMultipartAcceptHeaderFieldValue(
  mediaTypes,
  supportedMediaTypes
) {
  if (!Array.isArray(mediaTypes)) {
    throw new Error('Acceptable media types must be provided as an Array');
  }

  if (typeof supportedMediaTypes !== 'object') {
    throw new Error(
      'Supported media types must be provided as an Array or an Object'
    );
  }

  const supportedMediaTypesArray = Object.values(supportedMediaTypes).flat(1);

  supportedMediaTypesArray.forEach((supportedMediaType) => {
    assertMediaTypeIsValid(supportedMediaType);
  });

  const fieldValueParts = [];

  mediaTypes.forEach((item) => {
    const { transferSyntaxUID, mediaType } = item;

    assertMediaTypeIsValid(mediaType);

    let fieldValue = `multipart/related; type="${mediaType}"`;

    // supportedMediaTypesArray is a lookup table that maps Transfer Syntax UID
    // to one or more Media Types
    if (!supportedMediaTypesArray.includes(mediaType)) {
      if (
        (!mediaType.endsWith('/*') || !mediaType.endsWith('/')) &&
        mediaType !== 'application/octet-stream'
      ) {
        throw new Error(
          `Media type ${mediaType} is not supported for requested resource`
        );
      }
    }
    if (transferSyntaxUID) {
      if (transferSyntaxUID !== '*') {
        if (!Object.keys(supportedMediaTypes).includes(transferSyntaxUID)) {
          throw new Error(
            `Transfer syntax ${transferSyntaxUID} is not supported for requested resource`
          );
        }
        const expectedMediaTypes = supportedMediaTypes[transferSyntaxUID];

        if (!expectedMediaTypes.includes(mediaType)) {
          const actualType = mediaType.split('/')[0];

          expectedMediaTypes.map((expectedMediaType) => {
            const expectedType = expectedMediaType.split('/')[0];

            const haveSameType = actualType === expectedType;

            if (
              haveSameType &&
              (mediaType.endsWith('/*') || mediaType.endsWith('/'))
            ) {
              return null;
            }

            throw new Error(
              `Transfer syntax ${transferSyntaxUID} is not supported for requested resource`
            );
          });
        }
      }
      fieldValue += `; transfer-syntax=${transferSyntaxUID}`;
    }

    fieldValueParts.push(fieldValue);
  });

  return fieldValueParts.join(', ');
}
