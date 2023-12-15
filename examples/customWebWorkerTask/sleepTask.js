// wrap your task in an immediate function to avoid global namespace collisions with other tasks
(function () {
  let sleepConfig;

  function sleepTaskInitialize(config) {
    sleepConfig = config;
    console.log(sleepConfig);
  }

  function sleepTaskHandler(data, doneCallback) {
    // we fake real processing by setting a timeout
    setTimeout(function () {
      // once the task is done, we invoke the callback with our result
      if (typeof doneCallback === 'function') {
        doneCallback({});
      }
    }, sleepConfig.sleepTask.sleepTime);
  }

  // register ourselves to receive messages
  self.registerTaskHandler({
    taskType: 'sleepTask',
    handler: sleepTaskHandler,
    initialize: sleepTaskInitialize,
  });
})();
