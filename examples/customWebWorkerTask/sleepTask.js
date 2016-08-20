//console.log('custom web worker loaded');

var sleepConfig;

function sleepTaskInitialize(config) {
  sleepConfig = config;
}

function sleepTaskHandler(data) {

  // we fake real processing by setting a timeout
  setTimeout(function() {

    // once the task is done, we send a message back with our result
    self.postMessage({
      message: 'sleepTask',
      result: 'success',
      workerIndex: data.workerIndex
    });
  }, sleepConfig.sleepTask.sleepTime);
}

// register ourselves to receive messages
registerTaskHandler({
  taskId :'sleepTask',
  handler: sleepTaskHandler  ,
  initialize: sleepTaskInitialize
});
