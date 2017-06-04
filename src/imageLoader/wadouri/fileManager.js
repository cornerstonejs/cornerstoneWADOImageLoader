let files = [];

/**
 * Adds a file to the file manager
 *
 * @param file
 * @return {string} An imageId for the added file
 */
function add (file) {
  const fileIndex = files.push(file);

  return `dicomfile:${fileIndex - 1}`;
}

/**
 * Retrieve the file at a specific index in the fileManager
 *
 * @param {Number} index
 * @return {*}
 */
function get (index) {
  return files[index];
}

/**
 * Remove the file at a specific index in the fileManager
 *
 * @param {Number} index
 */
function remove (index) {
  files[index] = undefined;
}

/**
 * Erase all files stored in the file manager
 */
function purge () {
  files = [];
}

export default {
  add,
  get,
  remove,
  purge
};
