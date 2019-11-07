import { registerTaskHandler } from './webWorker/index.js';
import decodeTask from './webWorker/decodeTask/decodeTask.js';
// import { default as version } from '../version.js';

// TODO: Not sure if this is necessary, but we probably need it for deflate in dicomParser
/* eslint-disable-next-line import/extensions */
import 'pako';

// register our task
registerTaskHandler(decodeTask);

const cornerstoneWADOImageLoaderWebWorker = {
  registerTaskHandler,
  version: '0.0.0',
};

export { registerTaskHandler }; // , version };

export default cornerstoneWADOImageLoaderWebWorker;
