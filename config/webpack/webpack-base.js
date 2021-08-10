const path = require('path');
const webpack = require('webpack');
const rootPath = process.cwd();
const context = path.join(rootPath, 'src');
const outputPath = path.join(rootPath, 'examples', 'dist');
const CopyPlugin = require('copy-webpack-plugin');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const charLSWasm = path.join(
  rootPath,
  'node_modules',
  '@cornerstonejs/codec-charls',
  'dist',
  '*.wasm'
);

console.log(path.resolve(charLSWasm));

module.exports = {
  mode: 'development',
  context,
  entry: {
    cornerstoneWADOImageLoader: './imageLoader/index.js',
    cornerstoneWADOImageLoaderWebWorker: './webWorker/index.worker.js',
  },
  target: 'web',
  output: {
    library: {
      name: '[name]',
      type: 'umd',
      umdNamedDefine: true,
    },
    libraryTarget: 'umd',
    globalObject: 'this',
    path: outputPath,
    //publicPath: outputPath,
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
        test: /\.js$/,
        exclude: [/(node_modules)/, /(codecs)/],
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    //new CleanWebpackPlugin(),
    new webpack.ProgressPlugin(),
    //new BundleAnalyzerPlugin(),
    /*new CopyPlugin({
      patterns: [{ from: charLSWasm, to: outputPath }],
    }),*/
  ],
  /*optimization: {
    splitChunks: {
      // include all types of chunks
      chunks: 'all',
    },
  },*/
  //experiments: { asyncWebAssembly: true },
};
