import parseImageId from './parseImageId.js';
import fileManager from './fileManager.js';

function loadFileRequest (uri) {
  const parsedImageId = parseImageId(uri);
  const fileIndex = parseInt(parsedImageId.url, 10);
  const file = fileManager.get(fileIndex);

  const promise = new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = (e) => {
      const dicomPart10AsArrayBuffer = e.target.result;

      resolve(dicomPart10AsArrayBuffer);
    };

    fileReader.onerror = reject;

    fileReader.readAsArrayBuffer(file);
  });

  return {
    promise,
    cancelFn: undefined
  };
}

export default loadFileRequest;
