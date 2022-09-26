import { xhrRequest } from '../internal/index.js';
import findIndexOfString from './findIndexOfString.js';

function findBoundary(header) {
  for (let i = 0; i < header.length; i++) {
    if (header[i].substr(0, 2) === '--') {
      return header[i];
    }
  }
}

function findContentType(header) {
  for (let i = 0; i < header.length; i++) {
    if (header[i].substr(0, 13) === 'Content-Type:') {
      return header[i].substr(13).trim();
    }
  }
}

function uint8ArrayToString(data, offset, length) {
  offset = offset || 0;
  length = length || data.length - offset;
  let str = '';

  for (let i = offset; i < offset + length; i++) {
    str += String.fromCharCode(data[i]);
  }

  return str;
}

/**
 * Asserts that a given media type is valid.
 *
 * @params {String} mediaType media type
 */

function assertMediaTypeIsValid(mediaType) {
  if (!mediaType) {
    throw new Error(`Not a valid media type: ${mediaType}`);
  }
  const sepIndex = mediaType.indexOf('/');

  if (sepIndex === -1) {
    throw new Error(`Not a valid media type: ${mediaType}`);
  }
  const mediaTypeType = mediaType.slice(0, sepIndex);

  const types = ['application', 'image', 'text', 'video'];

  if (!types.includes(mediaTypeType)) {
    throw new Error(`Not a valid media type: ${mediaType}`);
  }
  if (mediaType.slice(sepIndex + 1).includes('/')) {
    throw new Error(`Not a valid media type: ${mediaType}`);
  }
}

/**
 * Parses media type and extracts its type and subtype.
 *
 * @param mediaType e.g. image/jpeg
 * @private
 */
function parseMediaType(mediaType) {
  assertMediaTypeIsValid(mediaType);

  return mediaType.split('/');
}

/**
 * Builds an accept header field value for HTTP GET multipart request
 messages.
 *
 * @param {Array} mediaTypes Acceptable media types
 * @param {Object} supportedMediaTypes Supported media types
 */

function buildMultipartAcceptHeaderFieldValue(mediaTypes, supportedMediaTypes) {
  if (!Array.isArray(mediaTypes)) {
    throw new Error('Acceptable media types must be provided as an Array');
  }

  if (typeof supportedMediaTypes !== 'object') {
    throw new Error(
      'Supported media types must be provided as an Array or an Object'
    );
  }

  const fieldValueParts = [];

  mediaTypes.forEach((item) => {
    const { transferSyntaxUID, mediaType } = item;

    assertMediaTypeIsValid(mediaType);

    let fieldValue = `multipart/related; type="${mediaType}"`;

    // SupportedMediaTypes is a lookup table that maps Transfer Syntax UID
    // to one or more Media Types
    if (!Object.values(supportedMediaTypes).flat(1).includes(mediaType)) {
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
          const actualType = parseMediaType(mediaType)[0];

          expectedMediaTypes.map((expectedMediaType) => {
            const expectedType = parseMediaType(expectedMediaType)[0];

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

function getPixelData(uri, imageId, mediaTypes) {
  const supportedMediaTypes = {
    '1.2.840.10008.1.2.5': ['image/x-dicom-rle'],
    '1.2.840.10008.1.2.4.50': ['image/jpeg'],
    '1.2.840.10008.1.2.4.51': ['image/jpeg'],
    '1.2.840.10008.1.2.4.57': ['image/jpeg'],
    '1.2.840.10008.1.2.4.70': ['image/jpeg', 'image/jll'],
    '1.2.840.10008.1.2.4.80': ['image/x-jls', 'image/jls'],
    '1.2.840.10008.1.2.4.81': ['image/x-jls', 'image/jls'],
    '1.2.840.10008.1.2.4.90': ['image/jp2'],
    '1.2.840.10008.1.2.4.91': ['image/jp2'],
    '1.2.840.10008.1.2.4.92': ['image/jpx'],
    '1.2.840.10008.1.2.4.93': ['image/jpx'],
  };

  const headers = {
    Accept: buildMultipartAcceptHeaderFieldValue(
      mediaTypes,
      supportedMediaTypes
    ),
  };

  return new Promise((resolve, reject) => {
    const loadPromise = xhrRequest(uri, imageId, headers);

    loadPromise.then(function (imageFrameAsArrayBuffer /* , xhr*/) {
      // request succeeded, Parse the multi-part mime response
      const response = new Uint8Array(imageFrameAsArrayBuffer);

      // First look for the multipart mime header
      const tokenIndex = findIndexOfString(response, '\r\n\r\n');

      if (tokenIndex === -1) {
        reject(new Error('invalid response - no multipart mime header'));
      }
      const header = uint8ArrayToString(response, 0, tokenIndex);
      // Now find the boundary  marker
      const split = header.split('\r\n');
      const boundary = findBoundary(split);

      if (!boundary) {
        reject(new Error('invalid response - no boundary marker'));
      }
      const offset = tokenIndex + 4; // skip over the \r\n\r\n

      // find the terminal boundary marker
      const endIndex = findIndexOfString(response, boundary, offset);

      if (endIndex === -1) {
        reject(new Error('invalid response - terminating boundary not found'));
      }

      // Remove \r\n from the length
      const length = endIndex - offset - 2;

      // return the info for this pixel data
      resolve({
        contentType: findContentType(split),
        imageFrame: {
          pixelData: new Uint8Array(imageFrameAsArrayBuffer, offset, length),
        },
      });
    }, reject);
  });
}

export default getPixelData;
