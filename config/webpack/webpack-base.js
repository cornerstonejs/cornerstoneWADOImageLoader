const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const rootPath = process.cwd();
const context = path.join(rootPath, 'src');
const wasm = path.join(rootPath, 'wasm');
const codecs = path.join(rootPath, 'codecs');
const outputPath = path.join(rootPath, 'examples', 'dist');

module.exports = {
  mode: 'development',
  context,
  entry: {
    cornerstoneWADOImageLoader: './imageLoader/index.js',
    cornerstoneWADOImageLoaderWebWorker: './webWorker/index.worker.js',
  },
  target: 'web',
  output: {
    filename: '[name].js',
    library: '[name]',
    libraryTarget: 'umd',
    globalObject: 'this',
    path: outputPath,
    umdNamedDefine: true,
  },
  devtool: 'source-map',
  externals: {
    'dicom-parser': {
      commonjs: 'dicom-parser',
      commonjs2: 'dicom-parser',
      amd: 'dicom-parser',
      root: 'dicomParser',
    },
  },
  module: {
    noParse: [/(codecs)/],
    rules: [
      // {
      //   enforce: 'pre',
      //   test: /\.js$/,
      //   exclude: /(node_modules)|(codecs)/,
      //   loader: 'eslint-loader',
      //   options: {
      //     failOnError: false,
      //   },
      // },
      {
        test: /\.worker\.js$/,
        use: {
          loader: 'worker-loader',
          options: { inline: true, fallback: false },
        },
      },
      {
        test: /\.js$/,
        exclude: [/(node_modules)/, /(codecs)/],
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  /*plugins: [
    new CopyPlugin({
      patterns: [{ from: wasm, to: outputPath }],
    }),
  ],*/
  node: { fs: 'empty' },
};
