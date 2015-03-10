var cornerstoneWADOImageLoader = (function (cornerstoneWADOImageLoader) {

	"use strict";

	if (cornerstoneWADOImageLoader === undefined) {
		cornerstoneWADOImageLoader = {};
	}

	function getImageMetadata(dataSet) {
		return {
			frameOfReferenceUID: dataSet.string('x00200052'),
			imageOrientationPatient: dataSet.string('x00200037'),
			imagePositionPatient: dataSet.string('x00200032'),
			pixelSpacing: dataSet.string('x00280030')
		};
	}

	// module exports
	cornerstoneWADOImageLoader.getImageMetadata = getImageMetadata;

	return cornerstoneWADOImageLoader;
}(cornerstoneWADOImageLoader));