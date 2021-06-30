/* global globalThis */

function getExternalDecoders() {
  if (globalThis.allDecoders) {
    return globalThis.allDecoders.default;
  }

  return {
    decodeJPEG2000: globalThis &&
      globalThis.decodeJpeg2000 && {
        decode: globalThis.decodeJpeg2000.default,
        initialize: globalThis.decodeJpeg2000.initializeJPEG2000,
      },
    decodeJPEGLossless: globalThis &&
      globalThis.decodeJpegLossless && {
        decode: globalThis.decodeJpegLossless.default,
      },
    decodeJPEGLS: globalThis &&
      globalThis.decodeJpegLS && {
        decode: globalThis.decodeJpegLS.default,
        initialize: globalThis.decodeJpegLS.initializeJPEGLS,
      },
    decodeJPEGBaseline: globalThis &&
      globalThis.decodeJpegBaseline && {
        decode: globalThis.decodeJpegBaseline.default,
      },
    decodeHTJ2K: globalThis &&
      globalThis.decodeHtj2k && {
        decode: globalThis.decodeHtj2k.default,
      },
  };
}

export default getExternalDecoders;
