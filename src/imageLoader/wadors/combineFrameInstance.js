import getValue from "./getValue";

export default function combineFrameInstance(frame, instance) {
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
      rest,
      ...Object.values(shared),
      ...Object.values(perFrame)
    );
  }

  return instance;
}
