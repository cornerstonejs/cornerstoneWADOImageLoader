// This script will load the WebWorkers and Codecs from unpkg url

try {
  window.cornerstoneWADOImageLoader.webWorkerManager.initialize({
    maxWebWorkers: 4,
    startWebWorkersOnDemand: true,
    webWorkerTaskPaths: [],
    taskConfiguration: {
      decodeTask: {
        initializeCodecsOnStartup: false,
        usePDFJS: false,
        strict: true,
        decoderPaths: [
          '/dist/decodeJpeg2000.js',
          '/dist/decodeJpegLS.js',
          '/dist/decodeJpegLossless.js',
        ],
      },
    },
  });
} catch (error) {
  throw new Error('cornerstoneWADOImageLoader is not loaded');
}
