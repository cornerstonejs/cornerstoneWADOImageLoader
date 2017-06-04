/**
 * Check if an image is an 8-bit JPEGBaseline color image
 *
 * @param {Object} imageFrame
 * @param {String} transferSyntax The image's transfer syntax
 * @return {boolean} Whether or not the image is a 8-bit JPEGBaseline color image
 */
export default function (imageFrame, transferSyntax) {
  transferSyntax = transferSyntax || imageFrame.transferSyntax;

  return (imageFrame.bitsAllocated === 8 &&
     transferSyntax === '1.2.840.10008.1.2.4.50' &&
     (imageFrame.samplesPerPixel === 3 || imageFrame.samplesPerPixel === 4));
}
