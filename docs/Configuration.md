# Configuration

The Cornerstone WADO Image Loader can be configured by the following:

```js
cornerstoneWADOImageLoader.configure(options);
```

Where options can have the following properties:

- `beforeSend` - A callback that is executed before a network request. passes
  the `XMLHttpRequest` object.
- `onloadend` - Callback triggered when downloading an image ends. Passes the
  event and params object.
- `onreadystatechange` - Callback triggered on state change of request. Passes
  the event and params object.
- `onprogress` - Callback triggered when download progress event is fired.
  PoProgress. Passes the event and params object.
- `errorInterceptor` - Callback which may be used to deal with errors. Passes an
  Error object with these additional properties:
  - `request` - The `XMLHttpRequest` object.
  - `response` - The `response`, if any.
  - `status` - The HTTP `status` code.
- `useWebWorkers` - Whether to decode in web workers.
- `imageCreated` - Callback allowing modification of newly created image
  objects.
- `decodeConfig` - The configuration for the decoder
  - `usePDFJS` to use OHIF image-JPEG2000
    https://github.com/OHIF/image-JPEG2000.
  - `decoderPaths` - Array of paths to decoder files (built in `/dist`)
  - `autoLoadDecoders` - default: `true` - Whether to load all decoders during
    configuration step. If false, will load them the first time an image needs
    to be decoded.
- `webWorkerConfig` - The configuration for web workers, if
  `useWebWorkers == true`. See [WebWorkers.md](./WebWorkers.md) for more
  information.

  - `maxWebWorkers` - controls how many web workers to create. Some browsers
    will return the number of cores available via the
    navigator.hardwareConcurrency. For those browsers that don't support this
    property, the default number of web workers is set to 1. The web worker
    framework will automatically use this property or set to 1 web worker if not
    available. You can override the number of web workers by setting this
    property yourself. You may want to do this to add support for additional web
    workers on browsers that don't support navigator.hardwareConcurrency or if
    you find that using all cores slows down the main ui thread too much.
  - `startWebWorkersOnDemand` - true if you want to create web workers only when
    needed, false if you want them all created on initialize (default).
  - `webWorkerTaskPaths` - This is an array of paths to custom web worker tasks.
    See section "Custom Web Worker Tasks" below for more information.
  - `taskConfiguration.decodeTask.initializeCodecsOnStartup` - By default, the
    web worker framework does not initialize the JPEG2000 or JPEG-LS decoders on
    startup. Initialization takes even more CPU (and time) than loading so it is
    disabled by default. If you expect to display JPEG-LS or JPEG2000 images
    frequently, you might want to enable this flag.

- `strict` - Whether strict mode for image decoding is on.
