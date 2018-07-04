/* eslint import/extensions: 0 */
import { expect } from 'chai';
import { external } from '../../../src/externalModules.js';
import webWorkerManager from '../../../src/imageLoader/webWorkerManager.js';

external.cornerstone = window.cornerstone;

describe('#wadouri > metadaProvider', function (done) {
  it('should return pixelSpacing undefined if it does not exist', function () {
    const config = {
      maxWebWorkers: 1,
      startWebWorkersOnDemand: true,
      webWorkerPath: '/base/dist/cornerstoneWADOImageLoaderWebWorker.js',
      taskConfiguration: {
        decodeTask: {
          loadCodecsOnStartup: true,
          initializeCodecsOnStartup: false,
          codecsPath: '/base/dist/cornerstoneWADOImageLoaderCodecs.js',
          usePDFJS: false
        }
      }
    };

    webWorkerManager.initialize(config);
    const imageId = 'wadouri://localhost:9876/base/testImages/no-pixel-spacing.dcm';

    try {
      window.cornerstone.loadImage(imageId).then((image) => {
        const { columnPixelSpacing, rowPixelSpacing } = image;

        expect(columnPixelSpacing).to.be(undefined);
        expect(rowPixelSpacing).to.be(undefined);
        done();
      }, (error) => {
        done(error.error);
      });
    } catch (error) {
      done(error);
    }
  });
});


