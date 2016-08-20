cornerstoneWADOImageLoader = {};

// flag to ensure codecs are loaded only once
var codecsLoaded = false;

// the configuration object for the decodeTask
var decodeConfig;

/**
 * Function to control loading and initializing the codecs
 * @param config
 */
function loadCodecs(config) {
  // prevent loading codecs more than once
  if(codecsLoaded) {
    return;
  }

  // Load the codecs
  //console.time('loadCodecs');
  self.importScripts(config.decodeTask.codecsPath);
  codecsLoaded = true;
  //console.timeEnd('loadCodecs');

  // Initialize the codecs
  if(config.decodeTask.initializeCodecsOnStartup) {
    //console.time('initializeCodecs');
    cornerstoneWADOImageLoader.initializeJPEG2000();
    cornerstoneWADOImageLoader.initializeJPEGLS();
    //console.timeEnd('initializeCodecs');
  }
}

/**
 * Task initialization function
 * @param config
 */
function decodeTaskInitialize(config) {
  decodeConfig = config;
  if(config.decodeTask.loadCodecsOnStartup) {
    loadCodecs(config);
  }
}

/**
 * Task handler function
 * @param data
 */
function decodeTaskHandler(data) {
  // Load the codecs if they aren't already loaded
  loadCodecs(decodeConfig);

  var imageFrame = data.data.imageFrame;

  // convert pixel data from ArrayBuffer to Uint8Array since web workers support passing ArrayBuffers but
  // not typed arrays
  var pixelData = new Uint8Array(data.data.pixelData);

  cornerstoneWADOImageLoader.decodeImageFrame(imageFrame, data.data.transferSyntax, pixelData);

  cornerstoneWADOImageLoader.calculateMinMax(imageFrame);

  // convert from TypedArray to ArrayBuffer since web workers support passing ArrayBuffers but not
  // typed arrays
  imageFrame.pixelData = imageFrame.pixelData.buffer;

  // Post the result message back to the UI thread and transfer the pixelData to avoid a gc operation on it
  self.postMessage({
    taskId: 'decodeTask',
    status: 'success',
    result: {
      imageFrame: imageFrame,
    },
    workerIndex: data.workerIndex
  }, [imageFrame.pixelData]);
}

// register our task
registerTaskHandler({
  taskId :'decodeTask',
  handler: decodeTaskHandler,
  initialize: decodeTaskInitialize
});
