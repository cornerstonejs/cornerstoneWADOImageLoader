const path = require('path');
const merge = require('./merge');
const rootPath = process.cwd();
const baseConfig = require('./webpack-base');
const TerserPlugin = require('terser-webpack-plugin');
const outputPath = path.join(rootPath, 'dist');

const prodConfig = {
  mode: 'production',
  stats: {
    children: true,
  },
  output: {
    library: {
      name: '[name]',
    },
    path: outputPath,
    filename: '[name].dynamic-import.min.js',
  },
  optimization: {
    // minimize: false,
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
    ],
  },
};

module.exports = merge(baseConfig, prodConfig);
