import Module from '../../../codecs/openjphjs-wasm.js';
import { setPixelDataType } from '../../imageLoader/setPixelDataType.js';

function getArrayBuffer(buffer) {
  const { buffer: b, byteOffset, byteLength } = buffer;

  return b.slice(byteOffset, byteOffset + byteLength);
}

function jph2raw(encodedFileBuffer, decodeLevel = 0, iterations = 1) {
  return new Promise(resolve => {
    // eslint-disable-next-line no-undef
    Module().then(openjphjs => {
      const decoder = new openjphjs.HTJ2KDecoder();
      const encodedBuffer = decoder.getEncodedBuffer(encodedFileBuffer.length);

      encodedBuffer.set(encodedFileBuffer);

      // do the actual benchmark
      //   const beginDecode = process.hrtime();

      for (let i = 0; i < iterations; i++) {
        decoder.decodeSubResolution(decodeLevel);
        // decoder.decode();
      }
      //   const decodeDuration = process.hrtime(beginDecode); // hrtime returns seconds/nanoseconds tuple
      //   const decodeDurationInSeconds =
      //     decodeDuration[0] + decodeDuration[1] / 1000000000;

      // Print out information about the decode
      //   console.log(
      //     `Decode took ${(decodeDurationInSeconds / iterations) * 1000} ms`
      //   );
      const frameInfo = decoder.getFrameInfo();

      console.log('  frameInfo = ', frameInfo);
      console.log(' imageOffset = ', decoder.getImageOffset());
      const decoded = decoder.getDecodedBuffer();

      console.log('  decoded length = ', decoded.length);

      decoder.delete();

      return resolve(decoded);
    });
  });
}

/**
 *
 * @param {*} imageFrame This is the DICOM headers describing the image frame
 * @param {*} pixelData This is the HTJ2K file as an ArrayBuffer
 * @returns
 */
function decodeHTJ2K(imageFrame, pixelData, decodeLevel) {
  // imageFrame.pixelData = await jph2raw(Buffer.from(pixelData));

  return jph2raw(pixelData, decodeLevel).then(data => {
    imageFrame.pixelData = getArrayBuffer(data);
    // imageFrame.pixelData = data;

    setPixelDataType(imageFrame);

    return imageFrame;
  });
}

export default decodeHTJ2K;
