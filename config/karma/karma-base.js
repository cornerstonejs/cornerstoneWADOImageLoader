const path = require('path');
const webpackConfig = require('../webpack');

/* eslint no-process-env:0 */
process.env.CHROME_BIN = require('puppeteer').executablePath();

// Deleting output.library to avoid "Uncaught SyntaxError: Unexpected token /" error
// when running testes (var test/foo_test.js = ...)
delete webpackConfig.output;

delete webpackConfig.devMiddleware;

// Karma will build the dependecy tree by itself
delete webpackConfig.entry;

// Code coverage
webpackConfig.module.rules.push({
  test: /\.js$/,
  include: path.resolve('./src/'),
  loader: 'istanbul-instrumenter-loader',
  options: {
    esModules: true,
  },
});

module.exports = {
  basePath: '../../',
  frameworks: ['mocha', 'webpack'],
  reporters: ['progress', 'coverage', 'spec'],
  files: [
    'node_modules/cornerstone-core/dist/cornerstone.js',
    'node_modules/dicom-parser/dist/dicomParser.js',
    'test/**/*_test.js',
    // http://localhost:[PORT]/base/test/[MY FILE].wasm
    {
      pattern: 'node_modules/@cornerstonejs/codec-charls/dist/*',
      watched: false,
      included: false,
      served: true,
      nocache: false,
    },
    {
      pattern: 'node_modules/@cornerstonejs/codec-openjpeg/dist/*',
      watched: false,
      included: false,
      served: true,
      nocache: false,
    },
    {
      pattern: 'node_modules/@cornerstonejs/codec-libjpeg-turbo-8bit/dist/*',
      watched: false,
      included: false,
      served: true,
      nocache: false,
    },
    {
      pattern: 'node_modules/@cornerstonejs/codec-libjpeg-turbo-16bit/dist/*',
      watched: false,
      included: false,
      served: true,
      nocache: false,
    },
    { pattern: 'testImages/*', included: false },
    { pattern: 'dist/*', included: false },
  ],
  mime: {
    'application/wasm': ['wasm'],
  },
  proxies: {
    '/charlswasm.wasm':
      '/base/node_modules/@cornerstonejs/codec-charls/dist/charlswasm.wasm',
    '/openjpegwasm.wasm':
      '/base/node_modules/@cornerstonejs/codec-openjpeg/dist/openjpegwasm.wasm',
    // TODO: what about 16? do we need unique names here?
    '/libjpegturbojs.js.mem':
      '/base/node_modules/@cornerstonejs/codec-libjpeg-turbo-8bit/dist/libjpegturbojs.js.mem',
    '/base/test/imageLoader/wadouri/': '/base/test/',
  },

  plugins: [
    'karma-webpack',
    'karma-mocha',
    'karma-chrome-launcher',
    'karma-firefox-launcher',
    'karma-coverage',
    'karma-spec-reporter',
  ],

  preprocessors: {
    'src/**/*.js': ['webpack'],
    'test/**/*_test.js': ['webpack'],
  },

  webpack: webpackConfig,

  webpackMiddleware: {
    noInfo: false,
    stats: {
      chunks: false,
      timings: false,
      errorDetails: true,
    },
  },

  coverageReporter: {
    dir: './coverage',
    reporters: [
      { type: 'html', subdir: 'html' },
      { type: 'lcov', subdir: '.' },
      { type: 'text', subdir: '.', file: 'text.txt' },
      { type: 'text-summary', subdir: '.', file: 'text-summary.txt' },
    ],
  },

  client: {
    captureConsole: true,
  },

  browserConsoleLogOptions: {
    level: 'log',
    format: '%b %T: %m',
    terminal: true,
  },
};
