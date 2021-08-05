import { setOptions } from './internal/index.js';
import webWorkerManager from './webWorkerManager.js';
import { loadDecoders } from '../externalDecoders.js';

function configure(options) {
  const newOptions = setOptions(options);

  if (newOptions.useWebWorkers) {
    webWorkerManager.initialize(newOptions.webWorkerConfig);
  }
  if (newOptions.decodeConfig.autoLoadDecoders) {
    loadDecoders();
  }

  return newOptions;
}

export default configure;
