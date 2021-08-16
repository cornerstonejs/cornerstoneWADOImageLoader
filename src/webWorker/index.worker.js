import { registerTaskHandler } from './webWorker.js';
import decodeTask from './decodeTask.js';
import { default as version } from '../version.js';

// TODO: Not sure if this is necessary, but we probably need it for deflate in dicomParser
/* eslint-disable-next-line import/extensions */
// import pako from 'pako';

// console.debug('pako loaded cornerstoneWADOImageLoaderWebWorker index.js');

// register our task
registerTaskHandler(decodeTask);

const cornerstoneWADOImageLoaderWebWorker = {
  registerTaskHandler,
  version,
};

export { registerTaskHandler, version };

export default cornerstoneWADOImageLoaderWebWorker;
