/* eslint import/extensions:0 */
import registerLoaders from './imageLoader/registerLoaders.js';

let internalCornerstone;
let internalDicomParser;

export default {
  set cornerstone (cs) {
    internalCornerstone = cs;
    registerLoaders();
  },
  get cornerstone () {
    if (!internalCornerstone && window && window.cornerstone) {
      internalCornerstone = window.cornerstone; // default to window.cornerstone
      registerLoaders();
    }
    return internalCornerstone;
  },
  set dicomParser (dp) {
    internalDicomParser = dp;
  },
  get dicomParser () {
    if (!internalDicomParser && window && window.dicomParser) {
      internalDicomParser = window.dicomParser; // default to window.dicomParser
    }
    return internalDicomParser;
  }
};

