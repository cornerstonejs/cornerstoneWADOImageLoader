(function ($, cornerstoneWADOImageLoader) {

  "use strict";

  // array of queued tasks sorted with highest priority task first
  var tasks = [];

  // array of web workers to dispatch decode tasks to
  var webWorkers = [];

  var defaultConfig = {
    maxWebWorkers: navigator.hardwareConcurrency || 1,
    webWorkerPath : '../../dist/cornerstoneWADOImageLoaderWebWorker.js',
    webWorkerTaskPaths: [],
    taskConfiguration: {
      'decodeTask' : {
        loadCodecsOnStartup : true,
        initializeCodecsOnStartup: false,
        codecsPath: '../dist/cornerstoneWADOImageLoaderCodecs.js',
        usePDFJS: false
      }
    }
  };


  var config;

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

          // get the highest priority task
          var task = tasks.shift();
          task.start = new Date().getTime();

          // update stats with how long this task was delayed (waiting in queue)
          var end = new Date().getTime();
          var delayed = end - task.added;
          statistics.totalTimeDelayedInMS += delayed;

          // assign this task to this web worker and send the web worker
          // a message to execute it
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
   * Function to handle a message from a web worker
   * @param msg
   */
  function handleMessageFromWorker(msg) {
    //console.log('handleMessageFromWorker', msg.data);
    if(msg.data.taskId === 'initialize') {
      webWorkers[msg.data.workerIndex].status = 'ready';
      startTaskOnWebWorker();
    } else {
      statistics.numTasksExecuting--;
      webWorkers[msg.data.workerIndex].status = 'ready';
      statistics.numTasksCompleted++;
      var end = new Date().getTime();
      statistics.totalTaskTimeInMS += end - webWorkers[msg.data.workerIndex].task.start;
      webWorkers[msg.data.workerIndex].task.deferred.resolve(msg.data.result);
      webWorkers[msg.data.workerIndex].task = undefined;
      startTaskOnWebWorker();
    }
  }

  /**
   * Spawns a new web worker
   */
  function spawnWebWorker() {
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

  /**
   * Initialization function for the web worker manager - spawns web workers
   * @param configObject
   */
  function initialize(configObject) {
    configObject = configObject || defaultConfig;

    // prevent being initialized more than once
    if(config) {
      throw new Error('WebWorkerManager already initialized');
    }

    config = configObject;

    config.maxWebWorkers = config.maxWebWorkers || (navigator.hardwareConcurrency || 1);

    // Spawn new web workers
    for(var i=0; i < config.maxWebWorkers; i++) {
      spawnWebWorker();
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