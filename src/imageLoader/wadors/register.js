import external from '../../externalModules.js';
import loadImage from './loadImage.js';
import { metaDataProvider } from './metaData/index.js';

export default function () {
  // register wadors scheme and metadata provider
  const { cornerstone } = external;
  cornerstone.registerImageLoader('wadors', loadImage);
  cornerstone.metaData.addProvider(metaDataProvider);
}
