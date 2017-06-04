import $ from 'jquery';
import * as cornerstone from 'cornerstone-core';
import createImage from '../createImage';
import parseImageId from './parseImageId';
import dataSetCacheManager from './dataSetCacheManager';
import getEncapsulatedImageFrame from './getEncapsulatedImageFrame';
import getUncompressedImageFrame from './getUncompressedImageFrame';
import loadFileRequest from './loadFileRequest';
import { xhrRequest } from '../internal';

/**
 * Add a decache callback function to clear out our dataSetCacheManager
 *
 * @param {Image} image
 */
function addDecache (image) {
  image.decache = function () {
    // console.log('decache');
    const parsedImageId = parseImageId(image.imageId);

    dataSetCacheManager.unload(parsedImageId.url);
  };
}

/**
 *
 * @param {DataSet} dataSet
 * @param {Number} frameIndex
 * @return {*}
 */
function getPixelData (dataSet, frameIndex) {
  const pixelDataElement = dataSet.elements.x7fe00010;

  if (pixelDataElement.encapsulatedPixelData) {
    return getEncapsulatedImageFrame(dataSet, frameIndex);
  }

  return getUncompressedImageFrame(dataSet, frameIndex);

}

/**
 *
 * @param dataSetPromise
 * @param imageId
 * @param frame
 * @param options
 * @return {*}
 */
function loadImageFromPromise (dataSetPromise, imageId, frame, options) {

  const start = new Date().getTime();

  frame = frame || 0;
  const deferred = $.Deferred();

  dataSetPromise.then(function (dataSet/* , xhr*/) {
    const pixelData = getPixelData(dataSet, frame);
    const transferSyntax = dataSet.string('x00020010');
    const loadEnd = new Date().getTime();
    const imagePromise = createImage(imageId, pixelData, transferSyntax, options);

    imagePromise.then(function (image) {
      image.data = dataSet;
      const end = new Date().getTime();

      image.loadTimeInMS = loadEnd - start;
      image.totalTimeInMS = end - start;
      addDecache(image);
      deferred.resolve(image);
    });
  }, function (error) {
    deferred.reject(error);
  });

  return deferred;
}

/**
 *
 * @param {String} scheme
 * @return {*}
 */
function getLoaderForScheme (scheme) {
  if (scheme === 'dicomweb' || scheme === 'wadouri') {
    return xhrRequest;
  } else if (scheme === 'dicomfile') {
    return loadFileRequest;
  }
}

/**
 * Load an imageId
 *
 * @param {String} imageId
 * @param {Object} options
 * @return {*}
 */
function loadImage (imageId, options) {
  const parsedImageId = parseImageId(imageId);
  const url = parsedImageId.url;
  let dataSet;

  // if the dataset for this url is already loaded, use it
  if (dataSetCacheManager.isLoaded(url)) {
    dataSet = dataSetCacheManager.get(url);

    return loadImageFromPromise(dataSet, imageId, parsedImageId.frame, options);
  }

  // load the dataSet via the dataSetCacheManager
  const loader = getLoaderForScheme(parsedImageId.scheme);

  dataSet = dataSetCacheManager.load(url, loader, imageId);

  return loadImageFromPromise(dataSet, imageId, parsedImageId.frame, options);
}

// register dicomweb and wadouri image loader prefixes
cornerstone.registerImageLoader('dicomweb', loadImage);
cornerstone.registerImageLoader('wadouri', loadImage);
cornerstone.registerImageLoader('dicomfile', loadImage);

export { loadImageFromPromise, getLoaderForScheme };
export default loadImage;
