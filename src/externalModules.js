let cornerstone = window.cornerstone;
let dicomParser = window.dicomParser;
let $ = window.$;
const imageLoaders = {};
const metaDataProviders = [];

export default {
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
    if (cornerstone) cornerstone.registerImageLoader(scheme, imageLoader);
    imageLoaders[scheme] = imageLoader;
  },
  addMetaDataProvider (provider) {
    if (cornerstone) cornerstone.metaData.addProvider(provider);
    metaDataProviders.push(provider);
  }
};

