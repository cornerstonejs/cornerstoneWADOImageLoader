import imageIdToURI from '../imageIdToURI.js';
import combineFrameInstance from "./combineFrameInstance"

let metadataByImageURI = [];

function add(imageId, metadata) {
  const imageURI = imageIdToURI(imageId);

  metadataByImageURI[imageURI] = metadata;
}

function get(imageId) {
  const imageURI = imageIdToURI(imageId);

  // multiframes images will have only one imageid returned by the dicomweb
  // client and registered in metadataByImageURI for all the n frames. If an
  // iamgeid does not have metadata, or it does not have at all, or the imageid
  // belongs to a frame, not registered in metadataByImageURI
  let metadata = metadataByImageURI[imageURI];
  if (!metadata) {
    // in this case it might indicate a multiframe imageid
    const lastSlashIdx = imageURI.indexOf('/frames/') + 8;
    const imageIdFrameless = imageURI.slice(
      0,
      lastSlashIdx
    );
    // get all text after the last slash and convert to a frame number
    const frame = parseInt(
      imageURI.slice(lastSlashIdx + 1),
      10
    );
    // retrieving the frame 1 that contains all multiframe information
    metadata = metadataByImageURI[`${imageIdFrameless}1`];
    if (metadata) {
      // create the metadata frame
      metadata = combineFrameInstance(frame, metadata);
    }
  }
  else
  {
    // if the metadata exists, test if this is the multiframe imageid
    if (metadata['00280008'] && metadata['00280008'] > 1)
    {
      const lastSlashIdx = imageURI.indexOf('/frames/') + 8;
      const frame = parseInt(
        imageURI.slice(lastSlashIdx + 1),
        10
      );
      // if is multiframe imageid, return only the frame 1 metadata
      if (frame===1) {
        metadata = combineFrameInstance(frame, metadata);
      }
    }
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
  getValue,
  remove,
  purge,
};
