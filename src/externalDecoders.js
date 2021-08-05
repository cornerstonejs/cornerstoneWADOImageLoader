/**
 * This module loads codecs for decoding compressed images, as these are often
 * quite large, so that the delivered bundle size can be optimized. Codecs this
 * way can be included piecemeal.
 */

/* global globalThis */
import { getOptions } from './imageLoader/internal/options.js';

let loadDecodersPromise;

/**
 * Function to dynamically load a codec script by appending a script tag to the
 * document. Returns promise which resolves when the script is loaded. This will
 * not work when using a web worker, `self.importScripts` is used for that.
 *
 * @param {string} path Path (src) to script to load
 * @returns Promise<>
 */
function loadScript(path) {
  return new Promise(resolve => {
    const script = document.createElement('script');

    document.head.appendChild(script);
    script.onload = function() {
      resolve();
    };
    script.onerror = function() {
      console.error(`Script ${path} failed to load.`);
    };
    script.src = path;
  });
}

/**
 * Function tries to dynamically load codec scripts, according to the list
 * passed to the cornerstoneWADOImageLoader.configure() function.
 *
 * @param {Array<string>} paths Array of paths to codec scripts to load
 * dynamically
 * @returns Promise<{}> Object with decoder functions
 */
function loadDecoders(paths) {
  // If decoders have already been loaded, just return promise
  if (loadDecodersPromise) {
    return loadDecodersPromise;
  }

  let decoderPaths = [];

  // When a web-worker calls this function, `paths` must be passed in as an
  // argument, as the global config is not accessible. Otherwise, use the paths
  // set in the config.
  if (paths) {
    decoderPaths = paths;
  } else {
    const { decodeConfig } = getOptions();

    decoderPaths = decodeConfig.decoderPaths;
  }

  // If no external decoders set, return empty object. Basic inlined decoders
  // will still work, such as little and big endian, RLE
  if (!decoderPaths || decoderPaths.length === 0) {
    console.warn(
      'No decoders configured. Only uncompressed or RLE images will be displayed.'
    );

    return Promise.resolve({});
  }

  // Detect if this is running in a web worker. If so, use `self.importScripts`
  // to load codecs. Otherwise, append script tag to DOM and wait for `onload`
  // event.
  loadDecodersPromise = new Promise(resolve => {
    if (typeof importScripts === 'function') {
      // In Web Worker
      decoderPaths.forEach(path => {
        const url = new URL(path, self.location.origin);

        self.importScripts(url.toString());
      });
      resolve(buildDecoderObject());
    } else {
      // In web main thread
      Promise.all(decoderPaths.map(path => loadScript(path))).then(() => {
        resolve(buildDecoderObject());
      });
    }
  });

  // Once all scripts have been loaded to the global object, find them and
  // return an object containing the decode functions.
  function buildDecoderObject() {
    let decoders = {};

    if (globalThis.allDecoders) {
      decoders = globalThis.allDecoders.default;
    } else {
      decoders = {
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

    return decoders;
  }

  return loadDecodersPromise;
}

export { loadDecoders };
