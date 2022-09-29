/**
 * Asserts that a given media type is valid.
 *
 * @params {String} mediaType media type
 */

export default function assertMediaTypeIsValid(mediaType) {
  if (!mediaType) {
    throw new Error(`Not a valid media type: ${mediaType}`);
  }
  const sepIndex = mediaType.indexOf('/');

  if (sepIndex === -1) {
    throw new Error(`Not a valid media type: ${mediaType}`);
  }
  const mediaTypeType = mediaType.slice(0, sepIndex);

  const types = ['application', 'image', 'text', 'video'];

  if (!types.includes(mediaTypeType)) {
    throw new Error(`Not a valid media type: ${mediaType}`);
  }
  if (mediaType.slice(sepIndex + 1).includes('/')) {
    throw new Error(`Not a valid media type: ${mediaType}`);
  }
}
