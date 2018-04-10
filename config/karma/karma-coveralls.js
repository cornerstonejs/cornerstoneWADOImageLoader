const extendConfiguration = require('./karma-extend.js');

module.exports = function (config) {
  'use strict';
  config.set(extendConfiguration({
    singleRun: true,
    reporters: ['progress', 'coverage', 'coveralls'],
    browsers: ['ChromeHeadless']
  }));
};
