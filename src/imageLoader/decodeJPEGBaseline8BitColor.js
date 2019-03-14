import getMinMax from '../shared/getMinMax.js';

function decodeJPEGBaseline8BitColor (imageFrame, pixelData, canvas) {
  const start = new Date().getTime();
  const imgBlob = new Blob([pixelData], { type: 'image/jpeg' });

  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = function (e) {
      const img = new Image();

      img.onload = function () {
        canvas.height = img.height;
        canvas.width = img.width;
        imageFrame.rows = img.height;
        imageFrame.columns = img.width;
        const context = canvas.getContext('2d');

        context.drawImage(this, 0, 0);
        const imageData = context.getImageData(0, 0, img.width, img.height);
        const end = new Date().getTime();

        imageFrame.pixelData = imageData.data;
        imageFrame.imageData = imageData;
        imageFrame.decodeTimeInMS = end - start;

        // calculate smallest and largest PixelValue
        const minMax = getMinMax(imageFrame.pixelData);

        imageFrame.smallestPixelValue = minMax.min;
        imageFrame.largestPixelValue = minMax.max;

        resolve(imageFrame);
      };

      img.onerror = function (error) {
        reject(error);
      };

      img.src = e.target.result;
    };

    fileReader.onerror = function (e) {
      reject(e);
    };

    fileReader.readAsDataURL(imgBlob);
  });
}

export default decodeJPEGBaseline8BitColor;
