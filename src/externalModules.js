import $ from 'jquery';
import * as dicomParser from 'dicom-parser';
import * as cornerstoneMath from 'cornerstone-math';
import registerLoaders from './imageLoader/registerLoaders.js';

let cornerstone;

const external = {
  set cornerstone (cs) {
    cornerstone = cs;

    registerLoaders(cornerstone);
  },
  get cornerstone () {
    return cornerstone;
  }
};

export { $, dicomParser, cornerstoneMath, external };
