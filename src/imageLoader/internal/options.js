const options = {
  // callback allowing customization of the xhr (e.g. adding custom auth headers, cors, etc)
  beforeSend (/* xhr, imageId */) {
  },
  // callback allowing modification of newly created image objects
  imageCreated (/* image */) {
  },
  strict: false,
  decodeConfig: {}
};

export function setOptions (newOptions) {
  Object.keys(newOptions).forEach((key) => {
    options[key] = newOptions[key];
  });
}

export function getOptions () {
  return options;
}
