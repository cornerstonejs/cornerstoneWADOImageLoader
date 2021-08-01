# Migrate to new configuration

- Codecs can now be included as needed (or all codecs included). This may
  drastically reduce the javascript bundle size depending on your needs.
  - In the configuration object, add `decodeConfig.decoderPaths`, with an array
    of paths to the desired codecs (included in `/dist`). If all codecs are
    desired, use `['path/to/allDecoders.min.js']`.
- `cornerstoneWADOImageLoader.webWorkerManager.initialize()` has been removed.
  Web worker configuration is now included in the regular configuration object:
  `cornerstoneWADOImageLoader.configure()`.
  - Copy web worker configuration to `webWorkerConfig` property of
    configuration.
  - Move `taskConfiguration.decodeTask.usePDFJS` to `decodeConfig.usePDFJS`.
