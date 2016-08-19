(function ($, cornerstoneWADOImageLoader) {

  "use strict";

  // array of waiting decode tasks sorted with highest priority task first
  var decodeTasks = [];

  // array of web workers to dispatch decode tasks to
  var webWorkers = [];

  var config = {
    maxWebWorkers: navigator.hardwareConcurrency || 1,
    webWorkerPath : '../../dist/cornerstoneWADOImageLoaderWebWorker.js',
    codecsPath: '../dist/cornerstoneWADOImageLoaderCodecs.js',
    otherWebWorkers: [{
      path: 'foo.js',
      config : {
        someOption: 42
      }
    }]
  };

  var statistics = {
    numDecodeTasksCompleted: 0,
    totalDecodeTimeInMS: 0,
    totalTimeDelayedInMS: 0,
  };

  /**
   * Function to start a task on a web worker
   */
  function startTaskOnWebWorker() {
    // return immediately if no decode tasks to do
    if(!decodeTasks.length) {
      return;
    }

    // look for a web worker that is ready
    for(var i=0; i < webWorkers.length; i++) {
       {
        if(webWorkers[i].status === 'ready') {
          // mark it as busy so tasks are not assigned to it
          webWorkers[i].status = 'busy';

          // get the highest priority decode task
          var decodeTask = decodeTasks.shift();
          decodeTask.start = new Date().getTime();

          // update stats with how long this task was delayed (waiting in queue)
          var end = new Date().getTime();
          var delayed = end - decodeTask.added;
          statistics.totalTimeDelayedInMS += delayed;

          // assign this decode task to this web worker and send the web worker
          // a message to decode it
          webWorkers[i].decodeTask = decodeTask;
          webWorkers[i].worker.postMessage({
            message: decodeTask.message,
            workerIndex: i,
            data: decodeTask.data
          });
          return;
        }
      }
    }
  }

  /**
   * Helper function to set pixel data to the right typed array.  This is needed because web workers
   * can transfer array buffers but not typed arrays
   * @param imageFrame
   */
  function setPixelDataType(imageFrame) {
    if(imageFrame.bitsAllocated === 16) {
      if(imageFrame.pixelRepresentation === 0) {
        imageFrame.pixelData = new Uint16Array(imageFrame.pixelData);
      } else {
        imageFrame.pixelData = new Int16Array(imageFrame.pixelData);
      }
    } else {
      imageFrame.pixelData = new Uint8Array(imageFrame.pixelData);
    }
  }

  /**
   * Function to handle a message from a web worker
   * @param msg
   */
  function handleMessageFromWorker(msg) {
    console.log('handleMessageFromWorker', msg.data);
    if(msg.data.message === 'initializeTaskCompleted') {
      webWorkers[msg.data.workerIndex].status = 'ready';
      startTaskOnWebWorker();
    } else if(msg.data.message === 'decodeTaskCompleted') {
      webWorkers[msg.data.workerIndex].status = 'ready';
      setPixelDataType(msg.data.imageFrame);

      statistics.numDecodeTasksCompleted++;
      statistics.totalDecodeTimeInMS += msg.data.imageFrame.decodeTimeInMS;

      var end = new Date().getTime();
      msg.data.imageFrame.webWorkerTimeInMS = end - webWorkers[msg.data.workerIndex].decodeTask.start;

      webWorkers[msg.data.workerIndex].decodeTask.deferred.resolve(msg.data.imageFrame);
      webWorkers[msg.data.workerIndex].decodeTask = undefined;
      startTaskOnWebWorker();
    } else {
      webWorkers[msg.data.workerIndex].status = 'ready';
      statistics.numDecodeTasksCompleted++;
      //statistics.totalDecodeTimeInMS += msg.data.imageFrame.decodeTimeInMS;
      //var end = new Date().getTime();
      //msg.data.imageFrame.webWorkerTimeInMS = end - webWorkers[msg.data.workerIndex].decodeTask.start;
      webWorkers[msg.data.workerIndex].decodeTask.deferred.resolve(msg.data);
      webWorkers[msg.data.workerIndex].decodeTask = undefined;
      startTaskOnWebWorker();
    }
  }

  /**
   * Initialization function for the web worker manager - spawns web workers
   * @param configObject
   */
  function initialize(configObject) {
    if(configObject) {
      config = configObject;
    }

    for(var i=0; i < config.maxWebWorkers; i++) {
      var worker = new Worker(config.webWorkerPath);
      webWorkers.push({
        worker: worker,
        status: 'initializing'
      });
      worker.addEventListener('message', handleMessageFromWorker);
      worker.postMessage({
        message: 'initializeTask',
        workerIndex: webWorkers.length - 1,
        config: config
      });
    }
  }

  /**
   * Function to add a decode task to be performed
   *
   * @param imageFrame
   * @param transferSyntax
   * @param pixelData
   * @param priority
   * @returns {*}
   */
  function addTask(message, data, priority) {
    if(!webWorkers.length) {
      initialize();
    }

    priority = priority || 0;
    var deferred = $.Deferred();

    // find the right spot to insert this decode task (based on priority)
    for(var i=0; i < decodeTasks.length; i++) {
      if(decodeTasks[i].priority >= priority) {
        break;
      }
    }

    // insert the decode task in the sorted position
    decodeTasks.splice(i, 0, {
      message: message,
      status: 'ready',
      added : new Date().getTime(),
      data: data,
      deferred: deferred,
      priority: priority
    });

    // try to start a task on the web worker since we just added a new task and a web worker may be available
    startTaskOnWebWorker();

    return deferred.promise();
  }

  /**
   * Function to return the statistics on running web workers
   * @returns {{numDecodeTasksCompleted: number, totalDecodeTimeInMS: number, totalTimeDelayedInMS: number}}
   */
  function getStatistics() {
    return statistics;
  }


  // module exports
  cornerstoneWADOImageLoader.webWorkerManager = {
    initialize : initialize,
    addTask : addTask,
    getStatistics: getStatistics
  };

}($, cornerstoneWADOImageLoader));