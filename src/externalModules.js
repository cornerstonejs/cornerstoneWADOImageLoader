/* eslint import/extensions:0 */
let cornerstone = window.cornerstone;
let dicomParser = window.dicomParser;
let $ = window.$;
const imageLoaders = {};
const metaDataProviders = [];

const external = {
  set cornerstone (cs) {
    cornerstone = cs;

    Object.keys(imageLoaders).forEach((scheme) => cornerstone.registerImageLoader(scheme, imageLoaders[scheme]));
    metaDataProviders.forEach((provider) => cornerstone.metaData.addProvider(provider));
  },
  get cornerstone () {
    return cornerstone;
  },
  set dicomParser (dp) {
    dicomParser = dp;
  },
  get dicomParser () {
    return dicomParser;
  },
  set $ (module) {
    $ = module;
  },
  get $ () {
    return $;
  },
  registerImageLoader (scheme, imageLoader) {
    console.log('registerImageLoader: ' + scheme);
    if (cornerstone) {
      cornerstone.registerImageLoader(scheme, imageLoader);
    }

    imageLoaders[scheme] = imageLoader;
  },
  addMetaDataProvider (provider) {
    console.log('addMetaDataProvider: ' + provider);
    if (cornerstone) {
      cornerstone.metaData.addProvider(provider);
    }

    metaDataProviders.push(provider);
  }
};

export default external;
