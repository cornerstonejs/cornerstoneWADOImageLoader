console.log('custom web worker loaded');
console.log('messageMap', messageMap);

function myCustomMessageHandler(data) {

  setTimeout(function() {
    self.postMessage({
      message: 'myCustomMessage',
      result: 'success',
      workerIndex: data.workerIndex
    });
  }, 30);
}

registerMessageHandler('myCustomMessage', myCustomMessageHandler);