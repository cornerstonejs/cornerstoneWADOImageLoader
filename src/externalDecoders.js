const externalDecoders = {
  get decoders() {
    return {
      decodeJPEG2000: window &&
        window.decodeJpeg2000 && {
          decode: window.decodeJpeg2000.default,
          initialize: window.decodeJpeg2000.initializeJPEG2000,
        },
      decodeJPEGLossless: window &&
        window.decodeJpegLossless && {
          decode: window.decodeJpegLossless.default,
        },
      decodeJPEGLS: window &&
        window.decodeJpegLS && {
          decode: window.decodeJpegLS.default,
          initialize: window.decodeJpegLS.initializeJPEGLS,
        },
      decodeJPEGBaseline: window &&
        window.decodeJpegBaseline && {
          decode: window.decodeJpegBaseline.default,
        },
      decodeHTJ2K: window &&
        window.decodeHtj2k && {
          decode: window.decodeHtj2k.default,
        },
    };
  },
};

export default externalDecoders;
