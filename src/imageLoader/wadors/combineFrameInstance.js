function getTagValue(tag, justElement = true) {
  if (tag && tag.Value) {
    if (tag.Value[0] && justElement) {
      return tag.Value[0];
    }

    return tag.Value;
  }

  return tag;
}

function getMultiframeInformation(
  PerFrameFunctionalGroupsSequence,
  SharedFunctionalGroupsSequence,
  frameNumber
) {
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

  return {
    shared,
    perFrame,
  };
}

// function that retrieves specific frame metadata information from multiframe
// metadata
export default function combineFrameInstance(frameNumber, instance) {
  let {
    52009230: PerFrameFunctionalGroupsSequence,
    52009229: SharedFunctionalGroupsSequence,
    '00280008': NumberOfFrames,
    // eslint-disable-next-line prefer-const
    ...rest
  } = instance;

  PerFrameFunctionalGroupsSequence = getTagValue(
    PerFrameFunctionalGroupsSequence,
    false
  );
  SharedFunctionalGroupsSequence = getTagValue(
    SharedFunctionalGroupsSequence,
    false
  );
  NumberOfFrames = getTagValue(NumberOfFrames);
  if (PerFrameFunctionalGroupsSequence || NumberOfFrames > 1) {
    const { shared, perFrame } = getMultiframeInformation(
      PerFrameFunctionalGroupsSequence,
      SharedFunctionalGroupsSequence,
      frameNumber
    );

    return Object.assign(
      rest,
      { '00280008': NumberOfFrames },
      ...Object.values(shared),
      ...Object.values(perFrame)
    );
  }

  return instance;
}
