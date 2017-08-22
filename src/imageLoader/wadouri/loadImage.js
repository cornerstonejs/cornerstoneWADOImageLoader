import $ from 'jquery';
import * as cornerstone from 'cornerstone-core';
import createImage from '../createImage';
import parseImageId from './parseImageId';
import dataSetCacheManager from './dataSetCacheManager';
import getEncapsulatedImageFrame from './getEncapsulatedImageFrame';
import getUncompressedImageFrame from './getUncompressedImageFrame';
import loadFileRequest from './loadFileRequest';
import { xhrRequest } from '../internal';

// add a decache callback function to clear out our dataSetCacheManager
function addDecache (imagePromise, imageId) {
  imagePromise.decache = function () {
    // console.log('decache');
    const parsedImageId = parseImageId(imageId);

    dataSetCacheManager.unload(parsedImageId.url);
  };
}

function getPixelData (dataSet, frameIndex) {
  const pixelDataElement = dataSet.elements.x7fe00010;

  if (pixelDataElement.encapsulatedPixelData) {
    return getEncapsulatedImageFrame(dataSet, frameIndex);
  }

  return getUncompressedImageFrame(dataSet, frameIndex);

}

function loadImageFromPromise (dataSetPromise, imageId, frame, sharedCacheKey, createImageOptions, callbacks) {

  const start = new Date().getTime();

  frame = frame || 0;
  const deferred = $.Deferred();

  dataSetPromise.then(function (dataSet/* , xhr*/) {
    try {
      const pixelData = getPixelData(dataSet, frame);
      const transferSyntax = dataSet.string('x00020010');
      const loadEnd = new Date().getTime();
      const imagePromise = createImage(imageId, pixelData, transferSyntax, createImageOptions);

      addDecache(imagePromise, imageId);

      imagePromise.then(function (image) {
        image.data = dataSet;
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
    } catch (error) {
      // Return the error, and the dataSet
      deferred.reject({
        error,
        dataSet
      });
    }
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
    return loadImageFromPromise(dataSetCacheManager.load(parsedImageId.url, loader, imageId), imageId, parsedImageId.frame, parsedImageId.url, options);
  }

  // load the dataSet via the dataSetCacheManager
  return loadImageFromPromise(dataSetCacheManager.load(parsedImageId.url, loader, imageId), imageId, parsedImageId.frame, parsedImageId.url, options);
}

// register dicomweb and wadouri image loader prefixes
cornerstone.registerImageLoader('dicomweb', loadImage);
cornerstone.registerImageLoader('wadouri', loadImage);
cornerstone.registerImageLoader('dicomfile', loadImage);

export { loadImageFromPromise, getLoaderForScheme };
export default loadImage;
