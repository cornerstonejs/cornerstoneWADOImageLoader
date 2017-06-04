import * as dicomParser from 'dicom-parser';

/**
 *
 * @param dataSet
 * @return {boolean} Whether or not the frames are fragmented
 */
function framesAreFragmented (dataSet) {
  const numberOfFrames = dataSet.intString('x00280008');
  const pixelDataElement = dataSet.elements.x7fe00010;

  return (numberOfFrames !== pixelDataElement.fragments.length);
}

/**
 * Function to deal with extracting an image frame from an encapsulated data set.
 *
 * @param dataSet
 * @param frameIndex
 * @return {*}
 */
export default function getEncapsulatedImageFrame (dataSet, frameIndex) {
  if (dataSet.elements.x7fe00010.basicOffsetTable.length) {
    // Basic Offset Table is not empty
    return dicomParser.readEncapsulatedImageFrame(dataSet, dataSet.elements.x7fe00010, frameIndex);
  }

  // Empty basic offset table
  if (framesAreFragmented(dataSet)) {
    const basicOffsetTable = dicomParser.createJPEGBasicOffsetTable(dataSet, dataSet.elements.x7fe00010);

    return dicomParser.readEncapsulatedImageFrame(dataSet, dataSet.elements.x7fe00010, frameIndex, basicOffsetTable);
  }

  return dicomParser.readEncapsulatedPixelDataFromFragments(dataSet, dataSet.elements.x7fe00010, frameIndex);
}
