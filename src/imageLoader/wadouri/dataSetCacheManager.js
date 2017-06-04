import $ from 'jquery';
import * as dicomParser from 'dicom-parser';
import { xhrRequest } from '../internal';

/**
 * This object supports loading of DICOM P10 dataset from a uri and caching it so it can be accessed
 * by the caller.  This allows a caller to access the datasets without having to go through cornerstone's
 * image loader mechanism.  One reason a caller may need to do this is to determine the number of frames
 * in a multiframe sop instance so it can create the imageId's correctly.
 */
let loadedDataSets = {};
let promises = {};

/**
 * Returns true if the wadouri for the specified index has been loaded
 *
 * @param uri
 * @return {boolean} Whether or not the DataSet is in the cache
 */
function isLoaded (uri) {
  return loadedDataSets[uri] !== undefined;
}

/**
 * Retrieve a loaded DataSet from the cache
 *
 * @param {String} uri
 * @return {DataSet}
 * @throws If the DataSet is not in the cache
 */
function get (uri) {
  // if already loaded return it right away
  if (!loadedDataSets[uri]) {
    throw new Error('dataSetCacheManager.get: DataSet has not been loaded yet');
  }

  return loadedDataSets[uri].dataSet;
}

/**
 * Loads the dicom dataset from the wadouri sp
 *
 * @param {String} uri
 * @param loadRequest
 * @param {String} imageId
 * @return {*}
 */
function load (uri, loadRequest, imageId) {
  loadRequest = loadRequest || xhrRequest;

  // if already loaded return it right away
  if (loadedDataSets[uri]) {
    // console.log('using loaded dataset ' + uri);
    const alreadyLoadedpromise = $.Deferred();

    loadedDataSets[uri].cacheCount++;
    alreadyLoadedpromise.resolve(loadedDataSets[uri].dataSet);

    return alreadyLoadedpromise;
  }

  // if we are currently loading this uri, return its promise
  if (promises[uri]) {
    // console.log('returning existing load promise for ' + uri);
    return promises[uri];
  }

  // console.log('loading ' + uri);

  // This uri is not loaded or being loaded, load it via an xhrRequest
  const promise = loadRequest(uri, imageId);

  // handle success and failure of the XHR request load
  const loadDeferred = $.Deferred();

  promise.then(function (dicomPart10AsArrayBuffer/* , xhr*/) {
    const byteArray = new Uint8Array(dicomPart10AsArrayBuffer);

    // Reject the promise if parsing the dicom file fails
    let dataSet;

    try {
      dataSet = dicomParser.parseDicom(byteArray);
    } catch (error) {
      loadDeferred.reject(error);

      return;
    }

    loadedDataSets[uri] = {
      dataSet,
      cacheCount: 1
    };
    loadDeferred.resolve(dataSet);
    // done loading, remove the promise
    delete promises[uri];
  }, function (error) {
    loadDeferred.reject(error);
  }).always(function () {
      // error thrown, remove the promise
    delete promises[uri];
  });

  promises[uri] = loadDeferred;

  return loadDeferred;
}

/**
 * Remove the cached/loaded dicom dataset for the specified wadouri to free up memory
 *
 * @param {String} uri
 */
function unload (uri) {
  // console.log('unload for ' + uri);
  if (loadedDataSets[uri]) {
    loadedDataSets[uri].cacheCount--;
    if (loadedDataSets[uri].cacheCount === 0) {
      // console.log('removing loaded dataset for ' + uri);
      delete loadedDataSets[uri];
    }
  }
}

/**
 * Removes all cached datasets from memory
 */
function purge () {
  loadedDataSets = {};
  promises = {};
}

export default {
  isLoaded,
  load,
  unload,
  purge,
  get
};
