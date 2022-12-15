export default function fixNMMetadata(metaData) {
  if (!metaData['00200032'] || metaData['00200037']) {
    // adjust metadata in case of multiframe NM data, as the diucom tags
    // 00200032 and 00200037 could be found only in the dicom tag 00540022
    if (
      metaData['00540022'] &&
      metaData['00540022'].Value &&
      metaData['00540022'].Value.length > 0
    ) {
      metaData['00200032'] = metaData['00540022'].Value[0]['00200032'];
      metaData['00200037'] = metaData['00540022'].Value[0]['00200037'];
    }
  }

  return metaData;
}
