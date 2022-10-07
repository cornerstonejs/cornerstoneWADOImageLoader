import external from '../../externalModules.js';
import { xhrRequest } from '../internal/index.js';

/**
 * This object supports loading of DICOM P10 dataset from a uri and caching it so it can be accessed
 * by the caller.  This allows a caller to access the datasets without having to go through cornerstone's
 * image loader mechanism.  One reason a caller may need to do this is to determine the number of frames
 * in a multiframe sop instance so it can create the imageId's correctly.
 */
let cacheSizeInBytes = 0;

let loadedDataSets = {};

let promises = {};

// returns true if the wadouri for the specified index has been loaded
function isLoaded(uri) {
  return loadedDataSets[uri] !== undefined;
}

function get(uri) {
  if (!loadedDataSets[uri]) {
    return;
  }

  return loadedDataSets[uri].dataSet;
}

// loads the dicom dataset from the wadouri sp
function load(uri, loadRequest = xhrRequest, imageId) {
  const { cornerstone, dicomParser } = external;

  // if already loaded return it right away
  if (loadedDataSets[uri]) {
    // console.log('using loaded dataset ' + uri);
    return new Promise((resolve) => {
      loadedDataSets[uri].cacheCount++;
      resolve(loadedDataSets[uri].dataSet);
    });
  }

  // if we are currently loading this uri, increment the cacheCount and return its promise
  if (promises[uri]) {
    // console.log('returning existing load promise for ' + uri);
    promises[uri].cacheCount++;

    return promises[uri];
  }

  // This uri is not loaded or being loaded, load it via an xhrRequest
  const loadDICOMPromise = loadRequest(uri, imageId);

  // handle success and failure of the XHR request load
  const promise = new Promise((resolve, reject) => {
    loadDICOMPromise
      .then(function (dicomPart10AsArrayBuffer) {
        const flags = { isPartialContent: false };

        // Allow passing extra data with the loader promise so as not to change
        // the API
        if (!(dicomPart10AsArrayBuffer instanceof ArrayBuffer)) {
          if (!dicomPart10AsArrayBuffer.arrayBuffer) {
            return reject(
              new Error(
                'If not returning ArrayBuffer, must return object with `arrayBuffer` parameter'
              )
            );
          }
          flags.isPartialContent =
            dicomPart10AsArrayBuffer.flags.isPartialContent;
          dicomPart10AsArrayBuffer = dicomPart10AsArrayBuffer.arrayBuffer;
        }

        const byteArray = new Uint8Array(dicomPart10AsArrayBuffer);

        // Reject the promise if parsing the dicom file fails
        let dataSet;

        try {
          if (flags.isPartialContent) {
            dataSet = dicomParser.parseDicom(byteArray, {
              untilTag: 'x7fe00010',
            });
            if (!dataSet.elements.x7fe00010) {
              console.warn('Pixel data not found!');
              // Re-fetch more of the file
            }

            let pixelDataSet;

            try {
              // This is expected to fail, but get the dataset anyways in the
              // error.
              pixelDataSet = dicomParser.parseDicom(byteArray);
            } catch (err) {
              console.error(err);
              console.log('pixel data dataset:', err.dataSet);
              pixelDataSet = err.dataSet;
            }

            dataSet.elements.x7fe00010 = pixelDataSet.elements.x7fe00010;

            // Fix up broken fragments
            const fragments = dataSet.elements.x7fe00010.fragments;
            const totalLength = dataSet.byteArray.length;

            for (const fragment of fragments) {
              const { position, length } = fragment;

              if (length > totalLength - position) {
                console.log(
                  `Truncated fragment, changing fragment length from ${
                    fragment.length
                  } to ${totalLength - position}`
                );
                fragment.length = totalLength - position;
              }
            }

            /**
             * Trying to first parse just the metadata up to the pixel data
         then, see if we can just parse the partial byte stream of the pixel
         data from that offset. but having trouble finding how to hook in to
         dicomparser to kick of parsing of just the pixel data element. might
         have to do it twice.
             */
          } else {
            dataSet = dicomParser.parseDicom(byteArray);
          }
        } catch (error) {
          return reject(error);
        }

        loadedDataSets[uri] = {
          dataSet,
          cacheCount: promise.cacheCount,
        };
        cacheSizeInBytes += dataSet.byteArray.length;
        resolve(dataSet);

        cornerstone.triggerEvent(cornerstone.events, 'datasetscachechanged', {
          uri,
          action: 'loaded',
          cacheInfo: getInfo(),
        });
      }, reject)
      .then(
        () => {
          // Remove the promise if success
          delete promises[uri];
        },
        () => {
          // Remove the promise if failure
          delete promises[uri];
        }
      );
  });

  promise.cacheCount = 1;

  promises[uri] = promise;

  return promise;
}

// remove the cached/loaded dicom dataset for the specified wadouri to free up memory
function unload(uri) {
  const { cornerstone } = external;

  // console.log('unload for ' + uri);
  if (loadedDataSets[uri]) {
    loadedDataSets[uri].cacheCount--;
    if (loadedDataSets[uri].cacheCount === 0) {
      // console.log('removing loaded dataset for ' + uri);
      cacheSizeInBytes -= loadedDataSets[uri].dataSet.byteArray.length;
      delete loadedDataSets[uri];

      cornerstone.triggerEvent(cornerstone.events, 'datasetscachechanged', {
        uri,
        action: 'unloaded',
        cacheInfo: getInfo(),
      });
    }
  }
}

export function getInfo() {
  return {
    cacheSizeInBytes,
    numberOfDataSetsCached: Object.keys(loadedDataSets).length,
  };
}

// removes all cached datasets from memory
function purge() {
  loadedDataSets = {};
  promises = {};
  cacheSizeInBytes = 0;
}

export default {
  isLoaded,
  load,
  unload,
  getInfo,
  purge,
  get,
};
