import { $ } from '../../externalModules.js';
import createImage from '../createImage.js';
import parseImageId from './parseImageId.js';
import dataSetCacheManager from './dataSetCacheManager.js';
import loadFileRequest from './loadFileRequest.js';
import getPixelData from './getPixelData.js';
import { xhrRequest } from '../internal/index.js';

// add a decache callback function to clear out our dataSetCacheManager
function addDecache (imagePromise, imageId) {
  imagePromise.decache = function () {
    // console.log('decache');
    const parsedImageId = parseImageId(imageId);

    dataSetCacheManager.unload(parsedImageId.url);
  };
}

function loadImageFromPromise (dataSetPromise, imageId, frame = 0, sharedCacheKey, createImageOptions, callbacks) {
  const start = new Date().getTime();
  const deferred = $.Deferred();

  dataSetPromise.then(function (dataSet/* , xhr*/) {
    const transferSyntax = dataSet.string('x00020010');
    const loadEnd = new Date().getTime();
    let imagePromise;

    try {
      const pixelData = getPixelData(dataSet, frame);

      imagePromise = createImage(imageId, pixelData, transferSyntax, createImageOptions);
      addDecache(deferred, imageId);
    } catch (error) {
      // Return the error, and the dataSet
      deferred.reject({
        error,
        dataSet
      });

      return deferred;
    }

    imagePromise.then(function (image) {
      image.data = dataSet;
      image.sharedCacheKey = sharedCacheKey;
      const end = new Date().getTime();

      image.loadTimeInMS = loadEnd - start;
      image.totalTimeInMS = end - start;
      if (callbacks !== undefined && callbacks.imageDoneCallback !== undefined) {
        callbacks.imageDoneCallback(image);
      }
      deferred.resolve(image);
    }, function (error) {
      // Return the error, and the dataSet
      deferred.reject({
        error,
        dataSet
      });
    });
  }, function (error) {
    deferred.reject({
      error
    });
  });

  return deferred;
}

function loadImageFromDataSet (dataSet, imageId, frame = 0, sharedCacheKey, options) {
  const start = new Date().getTime();
  const deferred = $.Deferred();

  const pixelData = getPixelData(dataSet, frame);
  const transferSyntax = dataSet.string('x00020010');
  const loadEnd = new Date().getTime();
  const imagePromise = createImage(imageId, pixelData, transferSyntax, options);

  imagePromise.then((image) => {
    image.data = dataSet;
    image.sharedCacheKey = sharedCacheKey;
    const end = new Date().getTime();

    image.loadTimeInMS = loadEnd - start;
    image.totalTimeInMS = end - start;
    addDecache(image);
    deferred.resolve(image);
  }, function (error) {
    deferred.reject(error);
  });

  return deferred;
}

function getLoaderForScheme (scheme) {
  if (scheme === 'dicomweb' || scheme === 'wadouri') {
    return xhrRequest;
  } else if (scheme === 'dicomfile') {
    return loadFileRequest;
  }
}

function loadImage (imageId, options) {
  const parsedImageId = parseImageId(imageId);
  const loader = getLoaderForScheme(parsedImageId.scheme);

  // if the dataset for this url is already loaded, use it
  if (dataSetCacheManager.isLoaded(parsedImageId.url)) {
    const dataSet = dataSetCacheManager.get(parsedImageId.url, loader, imageId);

    return loadImageFromDataSet(dataSet, imageId, parsedImageId.frame, parsedImageId.url, options);
  }

  // load the dataSet via the dataSetCacheManager
  const dataSetPromise = dataSetCacheManager.load(parsedImageId.url, loader, imageId);

  return loadImageFromPromise(dataSetPromise, imageId, parsedImageId.frame, parsedImageId.url, options);
}

export { loadImageFromPromise, getLoaderForScheme, loadImage };
