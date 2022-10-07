// This script will load the WebWorkers and Codecs from unpkg url
try {
  window.cornerstoneWADOImageLoader.webWorkerManager.initialize({
    maxWebWorkers: 1,
    startWebWorkersOnDemand: true,
    webWorkerTaskPaths: [],
    taskConfiguration: {
      decodeTask: {
        initializeCodecsOnStartup: true,
        strict: true,
      },
    },
  });
} catch (error) {
  throw new Error('cornerstoneWADOImageLoader is not loaded');
}
