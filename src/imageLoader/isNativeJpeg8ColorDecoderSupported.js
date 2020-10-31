export default function isNativeJpeg8ColorDecoderSupported() {
  return 'createImageBitmap' in window && 'OffscreenCanvas' in window;
}
