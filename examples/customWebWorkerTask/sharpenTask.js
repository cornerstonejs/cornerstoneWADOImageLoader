
(function () {
  var sharpenConfig;

  function initialize(config) {
    sharpenConfig = config;
  }

  function handler(data) {

    // convert pixel data from ArrayBuffer to Int16Array since web workers support passing ArrayBuffers but
    // not typed arrays
    var pixelData = new Int16Array(data.data.pixelData);
    var imageFrame = data.data.imageFrame;

    function getPixel(x,y, defaultValue) {
      // deal with boundaries
      if(x < 0 ||
        x >= imageFrame.width ||
        y < 0 ||
        y >= imageFrame.height) {
        return defaultValue | 0;
      }
      return pixelData[x + y * imageFrame.width];
    }

    function getSharpenedPixel(x,y){
      var pixel = getPixel(x,y);
      return(
        (getPixel(x,y) * 9) +
        (getPixel(x-1,y-1, pixel) * -1) +
        (getPixel(x,y-1,pixel) * -1) +
        (getPixel(x+1,y-1,pixel) * -1) +
        (getPixel(x-1,y,pixel) * -1) +
        (getPixel(x+1,y,pixel) * -1) +
        (getPixel(x-1,y+1,pixel) * -1) +
        (getPixel(x-1,y+1,pixel) * -1) +
        (getPixel(x-1,y+1,pixel) * -1));
    }

    // sharpen the image
    var shapenedPixelData = new Int16Array(data.data.pixelData.length)

    for(var y=0; y < imageFrame.height; y++) {
      for(var x=0; x < imageFrame.width; x++) {
        var pixel = getSharpenedPixel(x,y);
        // clamp
        pixel = Math.max(Math.min(pixel, 32768), -32767);
        shapenedPixelData[x + y * imageFrame.width] = pixel;
      }
    }

    // once the task is done, we send a message back with our result
    self.postMessage({
      message: 'sharpenTask',
      result: 'success',
      pixelData: shapenedPixelData.buffer,
      workerIndex: data.workerIndex
    }, [shapenedPixelData.buffer]);
  }

// register ourselves to receive messages
  registerTaskHandler({
    taskId :'sharpenTask',
    handler: handler  ,
    initialize: initialize
  });

}());

