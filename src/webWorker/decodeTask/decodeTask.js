
cornerstoneWADOImageLoader = {};

var codecsLoaded = false;

var decodeConfig;

function loadCodecs(config) {
  // prevent loading codecs more than once
  if(codecsLoaded) {
    return;
  }

  //console.time('loadCodecs');
  self.importScripts(config.codecsPath);
  codecsLoaded = true;
  //console.timeEnd('loadCodecs');

  if(config.initializeCodecsOnStartup) {
    //console.time('initializeCodecs');
    cornerstoneWADOImageLoader.initializeJPEG2000();
    cornerstoneWADOImageLoader.initializeJPEGLS();
    //console.timeEnd('initializeCodecs');
  }
}

function decodeTaskInitialize(config) {
  decodeConfig = config;
  if(config.loadCodecsOnStartup) {
    loadCodecs(config);
  }
}

function decodeTaskHandler(data) {
  loadCodecs(decodeConfig);

  //console.log(data);
  var imageFrame = data.data.imageFrame;
  var pixelData = new Uint8Array(data.data.pixelData);
  var transferSyntax = data.data.transferSyntax;

  cornerstoneWADOImageLoader.decodeImageFrame(imageFrame, transferSyntax, pixelData);
  cornerstoneWADOImageLoader.calculateMinMax(imageFrame);

  imageFrame.pixelData = imageFrame.pixelData.buffer;

  self.postMessage({
    message: 'decodeTask',
    status: 'success',
    result: {
      imageFrame: imageFrame,
    },
    workerIndex: data.workerIndex
  }, [imageFrame.pixelData]);
}

registerTaskHandler({
  taskId :'decodeTask',
  handler: decodeTaskHandler,
  initialize: decodeTaskInitialize
});
