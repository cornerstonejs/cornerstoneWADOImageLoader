import { xhrRequest } from '../internal/index.js';
import findIndexOfString from './findIndexOfString.js';
import buildMultipartAcceptHeaderFieldValue from '../../shared/mediaTypesUtils/buildMultipartAcceptHeaderFieldValue.js';

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
