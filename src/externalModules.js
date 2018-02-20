/* eslint import/extensions:0 */
let internalCornerstone;
let internalDicomParser;

export default {
  set cornerstone (cs) {
    internalCornerstone = cs;
  },
  get cornerstone () {
    if (!internalCornerstone) {
      internalCornerstone = (window ? window.cornerstone : undefined); // default to window.cornerstone
    }
    return internalCornerstone;
  },
  set dicomParser (dp) {
    internalDicomParser = dp;
  },
  get dicomParser () {
    if (!internalDicomParser) {
      internalDicomParser = (window ? window.dicomParser : undefined); // default to window.dicomParser
    }
    return internalDicomParser;
  }
};

