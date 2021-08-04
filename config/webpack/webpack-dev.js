const path = require('path');
const webpack = require('webpack');
const merge = require('./merge');
const baseConfig = require('./webpack-base');

const devConfig = {
  devServer: {
    hot: true,
    // Bundles; takes precedence over contentBase
    publicPath: '/dist/',
    // Static content
    contentBase: path.join(__dirname, './../../examples'),
    compress: true,
    port: 9000,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin({})
  ]
};

module.exports = merge(baseConfig, devConfig);
