import $ from 'jquery';
import { xhrRequest } from '../internal';
import findIndexOfString from './findIndexOfString';
import uint8ArrayToString from './uint8ArrayToString';

/**
 *
 * @param header
 * @return {*}
 */
function findBoundary (header) {
  for (let i = 0; i < header.length; i++) {
    if (header[i].substr(0, 2) === '--') {
      return header[i];
    }
  }
}

/**
 *
 * @param header
 * @return {String|Undefined}
 */
function findContentType (header) {
  for (let i = 0; i < header.length; i++) {
    if (header[i].substr(0, 13) === 'Content-Type:') {
      return header[i].substr(13).trim();
    }
  }
}

/**
 *
 * @param {String} uri
 * @param {String} imageId
 * @param {String} mediaType
 * @returns {Promise}
 */
export default function (uri, imageId, mediaType) {
  mediaType = mediaType || 'application/octet-stream';
  const headers = {
    accept: mediaType
  };

  const deferred = $.Deferred();

  const loadPromise = xhrRequest(uri, imageId, headers);

  loadPromise.then(function (imageFrameAsArrayBuffer/* , xhr*/) {

    // request succeeded, Parse the multi-part mime response
    const response = new Uint8Array(imageFrameAsArrayBuffer);

    // First look for the multipart mime header
    const tokenIndex = findIndexOfString(response, '\r\n\r\n');

    if (tokenIndex === -1) {
      deferred.reject('invalid response - no multipart mime header');
    }
    const header = uint8ArrayToString(response, 0, tokenIndex);

    // Now find the boundary marker
    const split = header.split('\r\n');
    const boundary = findBoundary(split);

    if (!boundary) {
      deferred.reject('invalid response - no boundary marker');
    }
    const offset = tokenIndex + 4; // skip over the \r\n\r\n

    // find the terminal boundary marker
    const endIndex = findIndexOfString(response, boundary, offset);

    if (endIndex === -1) {
      deferred.reject('invalid response - terminating boundary not found');
    }

    // Remove \r\n from the length
    const length = endIndex - offset - 2;

    // return the info for this pixel data
    deferred.resolve({
      contentType: findContentType(split),
      imageFrame: {
        pixelData: new Uint8Array(imageFrameAsArrayBuffer, offset, length)
      }
    });
  });

  return deferred.promise();
}
