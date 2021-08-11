const path = require('path');
const webpack = require('webpack');
const rootPath = process.cwd();
const context = path.join(rootPath, 'src');
const outputPath = path.join(rootPath, 'examples', 'dist');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;

module.exports = {
  mode: 'development',
  context,
  entry: {
    cornerstoneWADOImageLoader: './imageLoader/index.js',
    //cornerstoneWADOImageLoaderWebWorker: './webWorker/index.js',
  },
  target: 'web',
  output: {
    library: {
      name: '[name]',
      type: 'umd',
      //type: 'module',
      umdNamedDefine: true,
    },
    libraryTarget: 'umd',
    //libraryTarget: 'module',
    globalObject: 'this',
    path: outputPath,
    //chunkFormat: 'module',
    clean: true,
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
  resolve: {
    fallback: {
      fs: false,
      path: false,
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
        test: /\.wasm/,
        type: 'asset/resource',
      },
      {
        test: /\.worker\.js$/,
        use: {
          loader: 'worker-loader',
          options: { inline: 'no-fallback' },
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
  plugins: [new webpack.ProgressPlugin()], //, new BundleAnalyzerPlugin()],
  optimization: {
    /*splitChunks: {
      // include all types of chunks
      chunks: 'all',
    },
    runtimeChunk: 'single',*/
    //concatenateModules: false,
  },
  //experiments: { outputModule: true },
  //experiments: { asyncWebAssembly: true },
};
