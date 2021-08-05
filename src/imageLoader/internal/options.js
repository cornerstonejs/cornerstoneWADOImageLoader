let options = {
  // callback allowing customization of the xhr (e.g. adding custom auth headers, cors, etc)
  beforeSend(/* xhr, imageId */) {},
  // callback allowing modification of the xhr response before creating image objects
  beforeProcessing(xhr) {
    return Promise.resolve(xhr.response);
  },
  // callback allowing modification of newly created image objects
  imageCreated(/* image */) {},
  strict: false,
  useWebWorkers: true,
  webWorkerConfig: {
    maxWebWorkers: navigator.hardwareConcurrency || 1,
    startWebWorkersOnDemand: true,
    webWorkerTaskPaths: [],
    taskConfiguration: {
      decodeTask: {
        initializeCodecsOnStartup: false,
      },
    },
  },
  decodeConfig: {
    convertFloatPixelDataToInt: true,
    usePDFJS: false,
    decoderPaths: [],
    autoLoadDecoders: true,
  },
};

export function setOptions(newOptions) {
  options = Object.assign(options, newOptions);

  // Copy decode related options to decodeTask config
  options.webWorkerConfig.taskConfiguration.decodeTask = Object.assign(
    options.webWorkerConfig.taskConfiguration.decodeTask,
    options.decodeConfig,
    { strict: options.strict }
  );

  return options;
}

export function getOptions() {
  return options;
}
