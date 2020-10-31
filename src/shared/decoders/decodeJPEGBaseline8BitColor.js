function decodeJPEGBaseline8BitColor(imageFrame, pixelData) {
  const imgBlob = new Blob([pixelData], { type: 'image/jpeg' });

  return new Promise((resolve, reject) => {
    try {
      const start = new Date().getTime();

      createImageBitmap(imgBlob).then(imageBitmap => {
        const offscreen = new OffscreenCanvas(
          imageBitmap.width,
          imageBitmap.height
        );

        imageFrame.rows = imageBitmap.height;
        imageFrame.columns = imageBitmap.width;
        const context = offscreen.getContext('2d');

        context.drawImage(imageBitmap, 0, 0);
        const imageData = context.getImageData(
          0,
          0,
          imageBitmap.width,
          imageBitmap.height
        );
        const end = new Date().getTime();

        imageFrame.pixelData = imageData.data;
        imageFrame.imageData = imageData;
        imageFrame.decodeTimeInMS = end - start;

        // calculate smallest and largest PixelValue
        resolve(imageFrame);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export default decodeJPEGBaseline8BitColor;
