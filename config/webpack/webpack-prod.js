const path = require('path');
const merge = require('./merge');
const rootPath = process.cwd();
const baseConfig = require('./webpack-base');
const TerserPlugin = require('terser-webpack-plugin');
const outputPath = path.join(rootPath, 'dist');

const prodConfig = {
  mode: 'production',
  output: {
    path: outputPath,
    filename: '[name].min.js',
  },
  optimization: {
    //minimize: false,
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
    ],
  },
};

module.exports = merge(baseConfig, prodConfig);
