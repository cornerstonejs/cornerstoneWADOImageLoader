(function () {
  // We have no access to global variables, so we need to redeclare this here.
  function getMinMax(storedPixelData) {
    // we always calculate the min max values since they are not always
    // present in DICOM and we don't want to trust them anyway as cornerstone
    // depends on us providing reliable values for these
    let min = storedPixelData[0];

    let max = storedPixelData[0];

    let storedPixel;

    const numPixels = storedPixelData.length;

    for (let index = 1; index < numPixels; index++) {
      storedPixel = storedPixelData[index];
      min = Math.min(min, storedPixel);
      max = Math.max(max, storedPixel);
    }

    return {
      min,
      max,
    };
  }

  let convolveConfig;

  function initialize(config) {
    console.log('CONVOLVE TASK:', config);
    convolveConfig = config;
  }

  function handler(data, doneCallback) {
    /*if (doneCallback === undefined) {
      doneCallback = function (result, transferList) {
        // Send the result back to the main thread
        console.log('RESULT:', result);
        self.postMessage(
          {
            status: 'success',
            result,
          },
          transferList
        );
      };
    }*/

    if (!data || !data.data || !data.data.imageFrame) {
      console.error('Invalid data structure:', data);
    }

    // convert pixel data from ArrayBuffer to Int16Array since web workers support passing ArrayBuffers but
    // not typed arrays
    console.log('DATA:', data);
    const imageFrame = data.data.imageFrame;

    const typedArrayConstructor = self[imageFrame.typedArrayName];

    const pixelData = new typedArrayConstructor(data.data.pixelData);

    // get the kernel and calculate the origin
    const kernel = data.data.kernel;

    const multiplier = data.data.multiplier || 1;

    const origin = kernel.length / 2 - (kernel.length % 2) / 2;

    function getPixel(x, y) {
      // apply kernel origin
      x -= origin;
      y -= origin;

      // deal with borders by extending
      if (x < 0) {
        x = 0;
      }
      if (x >= imageFrame.width) {
        x = imageFrame.width - 1;
      }
      if (y < 0) {
        y = 0;
      }
      if (y >= imageFrame.height) {
        y = imageFrame.height - 1;
      }

      return pixelData[x + y * imageFrame.width];
    }

    function getConvolvedPixel(x, y) {
      let convolvedPixel = 0;

      for (let i = 0; i < kernel.length; i++) {
        for (let j = 0; j < kernel[i].length; j++) {
          convolvedPixel += getPixel(x + j, y + i) * kernel[i][j] * multiplier;
        }
      }

      return convolvedPixel;
    }

    // convolve the kernel over the image
    const convolvedPixelData = new typedArrayConstructor(
      data.data.pixelData.length
    );

    for (let y = 0; y < imageFrame.height; y++) {
      for (let x = 0; x < imageFrame.width; x++) {
        let pixel = getConvolvedPixel(x, y);
        // clamp

        pixel = Math.max(Math.min(pixel, 32768), -32767);
        convolvedPixelData[x + y * imageFrame.width] = pixel;
      }
    }

    // once the task is done, we send a message back with our result and pass the pixeldata
    // via the transferList to avoid a copy
    //if (typeof doneCallback === 'function') {

    /*doneCallback(
      {
        pixelData: convolvedPixelData.buffer,
        minMax: getMinMax(convolvedPixelData),
      },
      [convolvedPixelData.buffer]
    );*/
    console.log('INPUT ARRAY:', pixelData);
    console.log('RESULT:', convolvedPixelData);

    return {
      result: {
        pixelData: convolvedPixelData.buffer,
        minMax: getMinMax(convolvedPixelData),
      },
      transferList: [convolvedPixelData.buffer],
    };
  }

  // register ourselves to receive messages
  self.registerTaskHandler({
    taskType: 'convolveTask',
    handler,
    initialize,
  });
})();
