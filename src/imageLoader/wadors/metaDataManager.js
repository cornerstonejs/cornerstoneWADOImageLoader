import { convertToFalseColorImage } from 'cornerstone-core';
import imageIdToURI from '../imageIdToURI.js';
import combineFrameInstance from './combineFrameInstance.js';

let metadataByImageURI = [];

// get metadata information for the first frame
function retrieveFirstFrameMetadata(imageURI) {
  const lastSlashIdx = imageURI.indexOf('/frames/') + 8;
  // imageid string without frame number
  const imageIdFrameless = imageURI.slice(0, lastSlashIdx);
  // calculating frame number
  const frame = parseInt(imageURI.slice(lastSlashIdx), 10);
  // retrieving the frame 1 that contains multiframe information
  const metadataInformation = metadataByImageURI[`${imageIdFrameless}1`];

  return {
    metadataInformation,
    frame,
  };
}

function add(imageId, metadata) {
  const imageURI = imageIdToURI(imageId);
  const multiframe = metadata['00280008'] && metadata['00280008'] > 1;
  // add multiframe check

  metadataByImageURI[imageURI] = {
    metadata,
    multiframe,
  };
}

// multiframes images will have only one imageid returned by the dicomweb
// client and registered in metadataByImageURI for all the n frames. If an
// iamgeid does not have metadata, or it does not have at all, or the imageid
// belongs to a frame, not registered in metadataByImageURI
function get(imageId) {
  const imageURI = imageIdToURI(imageId);

  // dealing first with the non multiframe information
  let metadataInformation = metadataByImageURI[imageURI];

  if (metadataInformation) {
    if (!metadataInformation.multiframe) {
      return metadataInformation.metadata;
    }
  }

  let frame = 1;

  let metadata;

  if (!metadataInformation) {
    // in this case it could indicate a multiframe imageid
    // Try to get the first frame metadata, where is stored the multiframe info
    const firstFrameInfo = retrieveFirstFrameMetadata(imageURI);

    metadataInformation = firstFrameInfo.metadataInformation;
    frame = firstFrameInfo.frame;
  }

  if (metadataInformation) {
    metadata = combineFrameInstance(frame, metadataInformation.metadata);
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
};
