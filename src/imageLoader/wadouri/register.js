import external from '../../externalModules.js';
import { loadImage } from './loadImage.js';
import { metaDataProvider } from './metaData/index.js';

export default function () {
  // register dicomweb and wadouri image loader prefixes
  const { cornerstone } = external;
  cornerstone.registerImageLoader('dicomweb', loadImage);
  cornerstone.registerImageLoader('wadouri', loadImage);
  cornerstone.registerImageLoader('dicomfile', loadImage);

  // add wadouri metadata provider
  cornerstone.metaData.addProvider(metaDataProvider);
}
