//console.log('custom web worker loaded');

function myCustomTaskInitialize(config) {

}

function myCustomTaskHandler(data) {

  // we fake real processing by setting a timeout
  setTimeout(function() {

    // once the task is done, we send a message back with our result
    self.postMessage({
      message: 'myCustomMessage',
      result: 'success',
      workerIndex: data.workerIndex
    });
  }, 3000);
}

// register ourselves to receive messages
registerTaskHandler({
  taskId :'myCustomMessage',
  handler: myCustomTaskHandler,
  initialize: myCustomTaskInitialize
});
