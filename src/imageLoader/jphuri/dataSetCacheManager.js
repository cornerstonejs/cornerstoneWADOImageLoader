import external from '../../externalModules.js';
import { xhrRequest } from '../internal/index.js';
// import jph2raw from './jph2raw.js';

/**
 * This object supports loading of DICOM P10 dataset from a uri and caching it so it can be accessed
 * by the caller.  This allows a caller to access the datasets without having to go through cornerstone's
 * image loader mechanism.  One reason a caller may need to do this is to determine the number of frames
 * in a multiframe sop instance so it can create the imageId's correctly.
 */
let cacheSizeInBytes = 0;

let loadedDataSets = {};

let promises = {};

// returns true if the jphuri for the specified index has been loaded
function isLoaded(uri) {
  return loadedDataSets[uri] !== undefined;
}

function get(uri) {
  if (!loadedDataSets[uri]) {
    return;
  }

  return loadedDataSets[uri].dataSet;
}

// loads the dicom dataset from the jphuri sp
function load(uri, loadRequest = xhrRequest, imageId) {
  const { cornerstone, dicomParser } = external;

  // if already loaded return it right away
  if (loadedDataSets[uri]) {
    // console.log('using loaded dataset ' + uri);
    return new Promise(resolve => {
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

  // Get metadata url
  const metadataUri = uri.replace('.jph', '.metadata.dcm');

  // handle success and failure of the XHR request load
  const promise = new Promise((resolve, reject) => {
    loadRequest(metadataUri).then(function(dicomPart10AsArrayBuffer) {
      const byteArray = new Uint8Array(dicomPart10AsArrayBuffer);

      // Reject the promise if parsing the dicom file fails
      let dataSet;

      try {
        dataSet = dicomParser.parseDicom(byteArray);
      } catch (error) {
        return reject(error);
      }

      loadRequest(uri, imageId)
        // .then(function(jphImageFrameAsArrayBuffer) {
        //   return jph2raw(Buffer.from(jphImageFrameAsArrayBuffer));
        // })
        .then(function(jphImageFrame) {
          dataSet.jphImageFrame = Buffer.from(jphImageFrame);
          loadedDataSets[uri] = {
            dataSet,
            cacheCount: promise.cacheCount,
          };
          cacheSizeInBytes +=
            dataSet.byteArray.length + dataSet.jphImageFrame.byteLength;
          resolve(dataSet);

          cornerstone.triggerEvent(cornerstone.events, 'datasetscachechanged', {
            uri,
            action: 'loaded',
            cacheInfo: getInfo(),
          });
        })
        .then(
          () => {
            // Remove the promise if success
            delete promises[uri];
          },
          () => {
            // Remove the promise if failure
            delete promises[uri];
          }
        )
        .catch(err => {
          reject(err);
        });
    });
  });

  promise.cacheCount = 1;

  promises[uri] = promise;

  return promise;
}

// remove the cached/loaded dicom dataset for the specified jphuri to free up memory
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
}

export default {
  isLoaded,
  load,
  unload,
  getInfo,
  purge,
  get,
};
