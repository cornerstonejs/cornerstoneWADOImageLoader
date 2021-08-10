const path = require('path');
const webpack = require('webpack');
const merge = require('./merge');
const baseConfig = require('./webpack-base');

const devConfig = {
  output: {
    publicPath: '/dist/',
  },
  devServer: {
    hot: true,
    open: true,
    // Bundles; takes precedence over contentBase
    devMiddleware: {
      publicPath: '/dist/',
      writeToDisk: true,
    },
    // Static content
    static: path.resolve(path.join(__dirname, './../../examples')),
    port: 3000,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  /*plugins: [
    new webpack.HotModuleReplacementPlugin({})
  ]*/
};

module.exports = merge(baseConfig, devConfig);
