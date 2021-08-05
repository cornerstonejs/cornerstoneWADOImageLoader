import decodeHTJ2K from './decodeHTJ2K.js';
import decodeJPEG2000, { initializeJPEG2000 } from './decodeJPEG2000.js';
import decodeJPEGBaseline from './decodeJPEGBaseline.js';
import decodeJPEGLS, { initializeJPEGLS } from './decodeJPEGLS.js';
import decodeJPEGLossless from './decodeJPEGLossless.js';

export default {
  decodeHTJ2K: {
    decode: decodeHTJ2K,
  },
  decodeJPEG2000: {
    decode: decodeJPEG2000,
    initialize: initializeJPEG2000,
  },
  decodeJPEGBaseline: {
    decode: decodeJPEGBaseline,
  },
  decodeJPEGLS: {
    decode: decodeJPEGLS,
    initialize: initializeJPEGLS,
  },
  decodeJPEGLossless: {
    decode: decodeJPEGLossless,
  },
};
