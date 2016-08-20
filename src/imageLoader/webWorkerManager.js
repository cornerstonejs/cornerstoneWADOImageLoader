(function ($, cornerstoneWADOImageLoader) {

  "use strict";

  // array of waiting decode tasks sorted with highest priority task first
  var tasks = [];

  // array of web workers to dispatch decode tasks to
  var webWorkers = [];

  var config = {
    maxWebWorkers: navigator.hardwareConcurrency || 1,
    webWorkerPath : '../../dist/cornerstoneWADOImageLoaderWebWorker.js',
    webWorkerTaskPaths: [],
    taskConfiguration: {
      'decodeTask' : {
        loadCodecsOnStartup : true,
        initializeCodecsOnStartup: false,
        codecsPath: '../dist/cornerstoneWADOImageLoaderCodecs.js'
      }
    }
  };

  var statistics = {
    numQueuedTasks : 0,
    numTasksExecuting : 0,
    numTasksCompleted: 0,
    totalTaskTimeInMS: 0,
    totalTimeDelayedInMS: 0,
  };

  /**
   * Function to start a task on a web worker
   */
  function startTaskOnWebWorker() {
    // return immediately if no decode tasks to do
    if(!tasks.length) {
      return;
    }

    // look for a web worker that is ready
    for(var i=0; i < webWorkers.length; i++) {
       {
        if(webWorkers[i].status === 'ready') {
          // mark it as busy so tasks are not assigned to it
          webWorkers[i].status = 'busy';

          // get the highest priority decode task
          var task = tasks.shift();
          task.start = new Date().getTime();

          // update stats with how long this task was delayed (waiting in queue)
          var end = new Date().getTime();
          var delayed = end - task.added;
          statistics.totalTimeDelayedInMS += delayed;

          // assign this decode task to this web worker and send the web worker
          // a message to decode it
          webWorkers[i].task = task;
          webWorkers[i].worker.postMessage({
            taskId: task.taskId,
            workerIndex: i,
            data: task.data
          });
          statistics.numTasksExecuting++;
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
    //console.log('handleMessageFromWorker', msg.data);
    if(msg.data.taskId === 'initialize') {
      webWorkers[msg.data.workerIndex].status = 'ready';
      startTaskOnWebWorker();
    } else if(msg.data.taskId === 'decodeTask') {
      statistics.numTasksExecuting--;
      webWorkers[msg.data.workerIndex].status = 'ready';
      setPixelDataType(msg.data.result.imageFrame);

      statistics.numTasksCompleted++;
      var end = new Date().getTime();
      statistics.totalTaskTimeInMS += end - webWorkers[msg.data.workerIndex].task.start;

      msg.data.result.imageFrame.webWorkerTimeInMS = end - webWorkers[msg.data.workerIndex].task.start;

      webWorkers[msg.data.workerIndex].task.deferred.resolve(msg.data.result.imageFrame);
      webWorkers[msg.data.workerIndex].task = undefined;
      startTaskOnWebWorker();
    } else {
      statistics.numTasksExecuting--;
      webWorkers[msg.data.workerIndex].status = 'ready';
      statistics.numTasksCompleted++;
      var end = new Date().getTime();
      statistics.totalTaskTimeInMS += end - webWorkers[msg.data.workerIndex].task.start;
      webWorkers[msg.data.workerIndex].task.deferred.resolve(msg.data);
      webWorkers[msg.data.workerIndex].task = undefined;
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

    config.maxWebWorkers = config.maxWebWorkers || (navigator.hardwareConcurrency || 1);

    for(var i=0; i < config.maxWebWorkers; i++) {
      var worker = new Worker(config.webWorkerPath);
      webWorkers.push({
        worker: worker,
        status: 'initializing'
      });
      worker.addEventListener('message', handleMessageFromWorker);
      worker.postMessage({
        taskId: 'initialize',
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
    for(var i=0; i < tasks.length; i++) {
      if(tasks[i].priority >= priority) {
        break;
      }
    }

    // insert the decode task in the sorted position
    tasks.splice(i, 0, {
      taskId: message,
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
    statistics.numQueuedTasks = tasks.length;
    return statistics;
  }


  // module exports
  cornerstoneWADOImageLoader.webWorkerManager = {
    initialize : initialize,
    addTask : addTask,
    getStatistics: getStatistics
  };

}($, cornerstoneWADOImageLoader));