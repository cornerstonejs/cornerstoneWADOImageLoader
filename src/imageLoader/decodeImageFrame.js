/**
 */
(function ($, cornerstone, cornerstoneWADOImageLoader) {

  "use strict";

  function addDecodeTask(imageFrame, transferSyntax, pixelData) {
    return cornerstoneWADOImageLoader.webWorkerManager.addTask(
      'decodeTask',
      {
        imageFrame : imageFrame,
        transferSyntax : transferSyntax,
        pixelData : pixelData
      }, 5);
  }

  function decodeImageFrame(imageFrame, transferSyntax, pixelData, canvas) {
    // Implicit VR Little Endian
    if(transferSyntax === "1.2.840.10008.1.2") {
      return addDecodeTask(imageFrame, transferSyntax, pixelData);
    }
    // Explicit VR Little Endian
    else if(transferSyntax === "1.2.840.10008.1.2.1") {
      return addDecodeTask(imageFrame, transferSyntax, pixelData);
    }
    // Explicit VR Big Endian (retired)
    else if (transferSyntax === "1.2.840.10008.1.2.2" ) {
      return addDecodeTask(imageFrame, transferSyntax, pixelData);
    }
    // Deflate transfer syntax (deflated by dicomParser)
    else if(transferSyntax === '1.2.840.10008.1.2.1.99') {
      return addDecodeTask(imageFrame, transferSyntax, pixelData);
    }
    // RLE Lossless
    else if (transferSyntax === "1.2.840.10008.1.2.5" )
    {
      return addDecodeTask(imageFrame, transferSyntax, pixelData);
    }
    // JPEG Baseline lossy process 1 (8 bit)
    else if (transferSyntax === "1.2.840.10008.1.2.4.50")
    {
      if(imageFrame.bitsAllocated === 8)
      {
        return cornerstoneWADOImageLoader.decodeJPEGBaseline8Bit(imageFrame, canvas);
      } else {
        return addDecodeTask(imageFrame, transferSyntax, pixelData);
      }
    }
    // JPEG Baseline lossy process 2 & 4 (12 bit)
    else if (transferSyntax === "1.2.840.10008.1.2.4.51")
    {
      return addDecodeTask(imageFrame, transferSyntax, pixelData);
    }
    // JPEG Lossless, Nonhierarchical (Processes 14)
    else if (transferSyntax === "1.2.840.10008.1.2.4.57")
    {
      return addDecodeTask(imageFrame, transferSyntax, pixelData);
    }
    // JPEG Lossless, Nonhierarchical (Processes 14 [Selection 1])
    else if (transferSyntax === "1.2.840.10008.1.2.4.70" )
    {
      return addDecodeTask(imageFrame, transferSyntax, pixelData);
    }
    // JPEG-LS Lossless Image Compression
    else if (transferSyntax === "1.2.840.10008.1.2.4.80" )
    {
      return addDecodeTask(imageFrame, transferSyntax, pixelData);
    }
    // JPEG-LS Lossy (Near-Lossless) Image Compression
    else if (transferSyntax === "1.2.840.10008.1.2.4.81" )
    {
      return addDecodeTask(imageFrame, transferSyntax, pixelData);
    }
     // JPEG 2000 Lossless
    else if (transferSyntax === "1.2.840.10008.1.2.4.90")
    {
      return addDecodeTask(imageFrame, transferSyntax, pixelData);
    }
    // JPEG 2000 Lossy
    else if (transferSyntax === "1.2.840.10008.1.2.4.91")
    {
      return addDecodeTask(imageFrame, transferSyntax, pixelData);
    }
    /* Don't know if these work...
     // JPEG 2000 Part 2 Multicomponent Image Compression (Lossless Only)
     else if(transferSyntax === "1.2.840.10008.1.2.4.92")
     {
     return cornerstoneWADOImageLoader.decodeJPEG2000(dataSet, frame);
     }
     // JPEG 2000 Part 2 Multicomponent Image Compression
     else if(transferSyntax === "1.2.840.10008.1.2.4.93")
     {
     return cornerstoneWADOImageLoader.decodeJPEG2000(dataSet, frame);
     }
     */
    else
    {
      if(console && console.log) {
        console.log("Image cannot be decoded due to Unsupported transfer syntax " + transferSyntax);
      }
      throw "no decoder for transfer syntax " + transferSyntax;
    }

    var deferred = $.Deferred();
    deferred.resolve(imageFrame);
    return deferred.promise();
  }

  cornerstoneWADOImageLoader.decodeImageFrame = decodeImageFrame;
}($, cornerstone, cornerstoneWADOImageLoader));