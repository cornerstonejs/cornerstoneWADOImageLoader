
cornerstoneWADOImageLoader = {};

function initializeTask(data) {
  //console.log('web worker initialize ', data.workerIndex);

  var config = data.config;

  //console.time('loadingCodecs');
  self.importScripts(config.codecsPath );
  //console.timeEnd('loadingCodecs');

  // load any additional web workers
  if(data.config.otherWebWorkers) {
    for(var i=0; i < data.config.otherWebWorkers.length; i++) {
      self.importScripts(data.config.otherWebWorkers[i].path);
    }
  }

  self.postMessage({
    message: 'initializeTask',
    status: 'success',
    result: {
    },
    workerIndex: data.workerIndex
  });
}


function decodeTask(data) {
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

messageMap = {
  'initializeTask' : initializeTask,
  'decodeTask' : decodeTask
};


function registerMessageHandler(message, handler) {
  messageMap[message] = handler;
}

self.onmessage = function(msg) {
  //console.log('web worker onmessage', msg.data);
  messageMap[msg.data.message](msg.data);
};