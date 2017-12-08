import external from '../../externalModules.js';
import { getOptions } from './options.js';

function xhrRequest (url, imageId, headers = {}, params = {}) {
  const options = getOptions();

  // Make the request for the DICOM P10 SOP Instance
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open('get', url, true);
    xhr.responseType = 'arraybuffer';
    options.beforeSend(xhr, imageId);
    Object.keys(headers).forEach(function (key) {
      xhr.setRequestHeader(key, headers[key]);
    });

    params.deferred = {
      resolve,
      reject
    };
    params.url = url;
    params.imageId = imageId;

    // Event triggered when downloading an image starts
    xhr.onloadstart = function (event) {
      const { cornerstone, $ } = external;

      // Action
      if (options.onloadstart) {
        options.onloadstart(event, params);
      }

      // Event
      const eventData = {
        url,
        imageId
      };

      $(cornerstone.events).trigger('CornerstoneImageLoadStart', eventData);

      const customEvent = new CustomEvent('cornerstoneimageloadstart', { detail: eventData });

      cornerstone.events.dispatchEvent(customEvent);
    };

    // Event triggered when downloading an image ends
    xhr.onloadend = function (event) {
      const { cornerstone, $ } = external;

      // Action
      if (options.onloadend) {
        options.onloadend(event, params);
      }

      const eventData = {
        url,
        imageId
      };

      // Event
      $(cornerstone.events).trigger('CornerstoneImageLoadEnd', eventData);

      const customEvent = new CustomEvent('cornerstoneimageloadend', { detail: eventData });

      cornerstone.events.dispatchEvent(customEvent);
    };

    // handle response data
    xhr.onreadystatechange = function (event) {
      // Action
      if (options.onreadystatechange) {
        options.onreadystatechange(event, params);

        return;
      }

      // Default action
      // TODO: consider sending out progress messages here as we receive the pixel data
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(xhr.response, xhr);
        } else {
          // request failed, reject the Promise
          reject(xhr);
        }
      }
    };

    // Event triggered when downloading an image progresses
    xhr.onprogress = function (oProgress) {
      const { cornerstone, $ } = external;
      // console.log('progress:',oProgress)
      const loaded = oProgress.loaded; // evt.loaded the bytes browser receive
      let total;
      let percentComplete;

      if (oProgress.lengthComputable) {
        total = oProgress.total; // evt.total the total bytes seted by the header
        percentComplete = Math.round((loaded / total) * 100);
      }

      // Action
      if (options.onprogress) {
        options.onprogress(oProgress, params);
      }

      // Event
      const eventData = {
        url,
        imageId,
        loaded,
        total,
        percentComplete
      };

      $(cornerstone.events).trigger('CornerstoneImageLoadProgress', eventData);

      const customEvent = new CustomEvent('cornerstoneimageloadprogress', { detail: eventData });

      cornerstone.events.dispatchEvent(customEvent);
    };

    xhr.send();
  });
}

export default xhrRequest;
