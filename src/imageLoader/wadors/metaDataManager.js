import imageIdToURI from '../imageIdToURI.js';

let metadataByImageURI = [];

function getValue(tag, justElement = true) {
  if (tag.Value) {
    if (tag.Value[0] && justElement) {
      return tag.Value[0];
    }

    return tag.Value;
  }

  return tag;
}

function combineFrameInstance(frame, instance) {
  let {
    52009230: PerFrameFunctionalGroupsSequence,
    52009229: SharedFunctionalGroupsSequence,
    '00280008': NumberOfFrames,
    // eslint-disable-next-line prefer-const
    ...rest
  } = instance;

  PerFrameFunctionalGroupsSequence = getValue(
    PerFrameFunctionalGroupsSequence,
    false
  );
  SharedFunctionalGroupsSequence = getValue(
    SharedFunctionalGroupsSequence,
    false
  );
  NumberOfFrames = getValue(NumberOfFrames);

  if (PerFrameFunctionalGroupsSequence || NumberOfFrames > 1) {
    const frameNumber = Number.parseInt(frame || 1, 10);
    const shared = (
      SharedFunctionalGroupsSequence
        ? Object.values(SharedFunctionalGroupsSequence[0])
        : []
    )
      .map((it) => it[0])
      .filter((it) => it !== undefined && typeof it === 'object');
    const perFrame = (
      PerFrameFunctionalGroupsSequence
        ? Object.values(PerFrameFunctionalGroupsSequence[frameNumber - 1])
        : []
    )
      .map((it) => it.Value[0])
      .filter((it) => it !== undefined && typeof it === 'object');

    return Object.assign(
      { frameNumber },
      rest,
      ...Object.values(shared),
      ...Object.values(perFrame)
    );
  }

  return instance;
}

function add(imageId, metadata) {
  const imageURI = imageIdToURI(imageId);

  metadataByImageURI[imageURI] = metadata;
}

function get(imageId) {
  const imageURI = imageIdToURI(imageId);

  let metadata = metadataByImageURI[imageURI];

  if (!metadata) {
    // in this case try see if the imageId corresponds to multiframe
    const imageIdFrameless = imageURI.slice(
      0,
      imageURI.indexOf('/frames/') + 8
    );
    const frame = parseInt(
      imageURI.slice(imageURI.indexOf('/frames/') + 9),
      10
    );

    metadata = metadataByImageURI[`${imageIdFrameless}1`];
    if (metadata) {
      metadata = combineFrameInstance(frame, metadata);
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
