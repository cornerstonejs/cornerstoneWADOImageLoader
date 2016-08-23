
cornerstoneWADOImageLoaderWebWorker = {
  registerTaskHandler : undefined
};

(function () {


  // an object of task handlers
  var taskHandlers = {};

  // Flag to ensure web worker is only initialized once
  var initialized = false;

  // the configuration object passed in when the web worker manager is initialized
  var config;

  /**
   * Initialization function that loads additional web workers and initializes them
   * @param data
   */
  function initialize(data) {
    //console.log('web worker initialize ', data.workerIndex);
    // prevent initialization from happening more than once
    if(initialized) {
      return;
    }

    // save the config data
    config = data.config;

    // load any additional web worker tasks
    if(data.config.webWorkerTaskPaths) {
      for(var i=0; i < data.config.webWorkerTaskPaths.length; i++) {
        self.importScripts(data.config.webWorkerTaskPaths[i]);
      }
    }

    // initialize each task handler
    Object.keys(taskHandlers).forEach(function(key) {
      taskHandlers[key].initialize(config.taskConfiguration);
    });

    // tell main ui thread that we have completed initialization
    self.postMessage({
      taskId: 'initialize',
      status: 'success',
      result: {
      },
      workerIndex: data.workerIndex
    });

    initialized = true;
  }

  /**
   * Function exposed to web worker tasks to register themselves
   * @param taskHandler
   */
  cornerstoneWADOImageLoaderWebWorker.registerTaskHandler = function(taskHandler) {
    if(taskHandlers[taskHandler.taskId]) {
      console.log('attempt to register duplicate task handler "', taskHandler.taskId, '"');
      return false;
    }
    taskHandlers[taskHandler.taskId] = taskHandler;
    if(initialized) {
      taskHandler.initialize(config);
    }
  };

  /**
   * Web worker message handler - dispatches messages to the registered task handlers
   * @param msg
   */
  self.onmessage = function(msg) {
    //console.log('web worker onmessage', msg.data);
    if(msg.data.taskId === 'initialize') {
      initialize(msg.data);
      return;
    }

    // dispatch the message if there is a handler registered for it
    if(taskHandlers[msg.data.taskId]) {
      taskHandlers[msg.data.taskId].handler(msg.data, function(result, transferList) {
        self.postMessage({
          taskId: msg.data.taskId,
          status: 'success',
          result: result,
          workerIndex: msg.data.workerIndex
        }, transferList);
      });
      return;
    }

    // not task handler registered - send a failure message back to ui thread
    console.log('no task handler for ', msg.data.taskId);
    console.log(taskHandlers);
    self.postMessage({
      taskId: msg.data.taskId,
      status: 'failed - no task handler registered',
      workerIndex: msg.data.workerIndex
    });
  };

}());
