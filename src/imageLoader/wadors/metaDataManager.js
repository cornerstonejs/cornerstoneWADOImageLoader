import { convertToFalseColorImage } from 'cornerstone-core';
import imageIdToURI from '../imageIdToURI.js';
import { combineFrameInstance } from './combineFrameInstance.js';
import getValue from './metaData/getValue.js';

let metadataByImageURI = [];

// get metadata information for the first frame
function _retrieveFirstFrameMetadata(imageURI) {
  const lastSlashIdx = imageURI.indexOf('/frames/') + 8;
  // imageid string without frame number
  const imageIdFrameless = imageURI.slice(0, lastSlashIdx);
  // calculating frame number
  const frame = parseInt(imageURI.slice(lastSlashIdx), 10);
  // retrieving the frame 1 that contains multiframe information

  const metadata = metadataByImageURI[`${imageIdFrameless}1`];

  return {
    metadata,
    frame,
  };
}

function retrieveFirstFrameMetadata(imageId) {
  const imageURI = imageIdToURI(imageId);

  return _retrieveFirstFrameMetadata(imageURI);
}

function isMultiFrame(metadata) {
  // Checks if dicomTag NumberOf Frames exists and it is greater than one
  const numberOfFrames = getValue(metadata['00280008']);

  return numberOfFrames && numberOfFrames > 1;
}

function add(imageId, metadata) {
  const imageURI = imageIdToURI(imageId);

  metadataByImageURI[imageURI] = metadata;
}

// multiframes images will have only one imageid returned by the dicomweb
// client and registered in metadataByImageURI for all the n frames. If an
// iamgeid does not have metadata, or it does not have at all, or the imageid
// belongs to a frame, not registered in metadataByImageURI
function get(imageId) {
  const imageURI = imageIdToURI(imageId);

  // dealing first with the non multiframe information
  let metadata = metadataByImageURI[imageURI];

  if (metadata) {
    if (!isMultiFrame(metadata)) {
      return metadata;
    }
  }

  let frame = 1;

  if (!metadata) {
    // in this case it could indicate a multiframe imageid
    // Try to get the first frame metadata, where is stored the multiframe info
    const firstFrameInfo = _retrieveFirstFrameMetadata(imageURI);

    metadata = firstFrameInfo.metadata;
    frame = firstFrameInfo.frame;
  }

  if (metadata) {
    metadata = combineFrameInstance(frame, metadata);
  }

  return metadata;
}

function remove(imageId) {
  const imageURI = imageIdToURI(imageId);

  metadataByImageURI[imageURI] = undefined;
}

function purge() {
  metadataByImageURI = [];
}

export default {
  add,
  get,
  remove,
  purge,
  retrieveFirstFrameMetadata,
};
