//console.log('custom web worker loaded');

function myCustomMessageHandler(data) {

  setTimeout(function() {
    self.postMessage({
      message: 'myCustomMessage',
      result: 'success',
      workerIndex: data.workerIndex
    });
  }, 3000);
}

registerMessageHandler('myCustomMessage', myCustomMessageHandler);