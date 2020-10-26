import cornerstoneWADOImageLoaderWebWorker from '../webWorker/index.worker.js';

import { getOptions } from './internal/options.js';

// the taskId to assign to the next task added via addTask()
let nextTaskId = 0;

// array of queued tasks sorted with highest priority task first
const tasks = [];

// array of web workers to dispatch decode tasks to
const webWorkers = [];

// The options for CornerstoneWADOImageLoader
const options = getOptions();

const defaultConfig = {
  maxWebWorkers: navigator.hardwareConcurrency || 1,
  startWebWorkersOnDemand: true,
  webWorkerTaskPaths: [],
  taskConfiguration: {
    decodeTask: {
      initializeCodecsOnStartup: false,
      usePDFJS: false,
      strict: options.strict,
    },
  },
  workerRecycleThreshold: 0
};

let config;

const statistics = {
  maxWebWorkers: 0,
  numWebWorkers: 0,
  numTasksQueued: 0,
  numTasksExecuting: 0,
  numTasksCompleted: 0,
  totalTaskTimeInMS: 0,
  totalTimeDelayedInMS: 0,
};

/**
 * Function to start a task on a web worker
 */
function startTaskOnWebWorker() {
  // return immediately if no decode tasks to do
  if (!tasks.length) {
    return;
  }

  // look for a web worker that is ready
  for (let i = 0; i < webWorkers.length; i++) {
    if (webWorkers[i].status === 'ready') {
      // mark it as busy so tasks are not assigned to it
      webWorkers[i].status = 'busy';

      // get the highest priority task
      const task = tasks.shift();

      task.start = new Date().getTime();

      // update stats with how long this task was delayed (waiting in queue)
      const end = new Date().getTime();

      statistics.totalTimeDelayedInMS += end - task.added;

      // assign this task to this web worker and send the web worker
      // a message to execute it
      webWorkers[i].task = task;
      webWorkers[i].worker.postMessage(
        {
          taskType: task.taskType,
          workerIndex: i,
          data: task.data,
        },
        task.transferList
      );
      statistics.numTasksExecuting++;

      return;
    }
  }

  // if no available web workers and we haven't started max web workers, start a new one
  if (webWorkers.length < config.maxWebWorkers) {
    spawnWebWorker();
  }
}

/**
 * Function to handle a message from a web worker
 * @param msg
 */
function handleMessageFromWorker(msg) {
  // console.log('handleMessageFromWorker', msg.data);
  const index = msg.data.workerIndex;
  const item = webWorkers[index];

  if (msg.data.taskType === 'initialize') {
    item.status = 'ready';
    startTaskOnWebWorker();
  } else {
    const start = item.task.start;

    const action = msg.data.status === 'success' ? 'resolve' : 'reject';
    item.task.deferred[action](msg.data.result);
    item.task = undefined;
    statistics.numTasksExecuting--;
    item.status = 'ready';
    statistics.numTasksCompleted++;

    // recycle thread
    ++item.numTasksCompleted;
    const threshold = config.workerRecycleThreshold || 0;
    if (threshold > 0 && item.numTasksCompleted >= threshold) {
      item.worker.terminate();
      spawnWebWorker(index);
    }

    const end = new Date().getTime();

    statistics.totalTaskTimeInMS += end - start;
    startTaskOnWebWorker();
  }
}

/**
 * Spawns a new web worker
 */
function spawnWebWorker(workerIndex) {
  if (workerIndex === undefined) {
    workerIndex = webWorkers.length;
  }

  // prevent exceeding maxWebWorkers
  if (workerIndex >= config.maxWebWorkers) {
    return;
  }

  // spawn the webworker
  const item =
  {
    worker: new Worker(config.webWorkerPath),
    status: 'initializing',
    numTasksCompleted: 0
  };

  if (workerIndex < webWorkers.length) {
    webWorkers[workerIndex] = item;
  } else {
    webWorkers.push(item);
  }

  item.worker.addEventListener('message', handleMessageFromWorker);
  item.worker.postMessage({
    taskType: 'initialize',
    workerIndex,
    config
  });
}

/**
 * Initialization function for the web worker manager - spawns web workers
 * @param configObject
 */
function initialize (configObject) {
  configObject = configObject || defaultConfig;

  // prevent being initialized more than once
  if (config) {
    throw new Error('WebWorkerManager already initialized');
  }

  config = configObject;

  config.maxWebWorkers =
    config.maxWebWorkers || (navigator.hardwareConcurrency || 1);
  config.workerRecycleThreshold = config.workerRecycleThreshold || 0; // 0 means never recycle

  // Spawn new web workers
  if (!config.startWebWorkersOnDemand) {
    for (let i = 0; i < config.maxWebWorkers; i++) {
      spawnWebWorker();
    }
  }
}

/**
 * Terminate all running web workers.
 */
function terminate() {
  for (let i = 0; i < webWorkers.length; i++) {
    webWorkers[i].worker.terminate();
  }
  webWorkers.length = 0;
  config = undefined;
}

/**
 * dynamically loads a web worker task
 * @param sourcePath
 * @param taskConfig
 */
function loadWebWorkerTask(sourcePath, taskConfig) {
  // add it to the list of web worker tasks paths so on demand web workers
  // load this properly
  config.webWorkerTaskPaths.push(sourcePath);

  // if a task specific configuration is provided, merge it into the config
  if (taskConfig) {
    config.taskConfiguration = Object.assign(
      config.taskConfiguration,
      taskConfig
    );
  }

  // tell each spawned web worker to load this task
  for (let i = 0; i < webWorkers.length; i++) {
    webWorkers[i].worker.postMessage({
      taskType: 'loadWebWorkerTask',
      workerIndex: webWorkers.length - 1,
      sourcePath,
      config,
    });
  }
}

/**
 * Function to add a decode task to be performed
 *
 * @param taskType - the taskType for this task
 * @param data - data specific to the task
 * @param priority - optional priority of the task (defaults to 0), > 0 is higher, < 0 is lower
 * @param transferList - optional array of data to transfer to web worker
 * @returns {*}
 */
function addTask(taskType, data, priority = 0, transferList) {
  if (!config) {
    initialize();
  }

  let deferred = {};
  const promise = new Promise((resolve, reject) => {
    deferred = {
      resolve,
      reject,
    };
  });

  // find the right spot to insert this decode task (based on priority)
  let i;

  for (i = 0; i < tasks.length; i++) {
    if (tasks[i].priority < priority) {
      break;
    }
  }

  const taskId = nextTaskId++;

  // insert the decode task at position i
  tasks.splice(i, 0, {
    taskId,
    taskType,
    status: 'ready',
    added: new Date().getTime(),
    data,
    deferred,
    priority,
    transferList,
  });

  // try to start a task on the web worker since we just added a new task and a web worker may be available
  startTaskOnWebWorker();

  return {
    taskId,
    promise,
  };
}


/**
  * purge tasks leaving only as many tasks as 'ready' threads
 */
function purgeTasks () {
  let keep = 0;
  for (let i = 0; i < webWorkers.length; i++) {
    if (webWorkers[i].status === 'ready') {
      ++keep;
    }
  }
  tasks.splice(keep);
}


/**
 * Changes the priority of a queued task
 * @param taskId - the taskId to change the priority of
 * @param priority - priority of the task (defaults to 0), > 0 is higher, < 0 is lower
 * @returns boolean - true on success, false if taskId not found
 */
function setTaskPriority(taskId, priority = 0) {
  // search for this taskId
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].taskId === taskId) {
      // taskId found, remove it
      const task = tasks.splice(i, 1)[0];

      // set its priority
      task.priority = priority;

      // find the right spot to insert this decode task (based on priority)
      for (i = 0; i < tasks.length; i++) {
        if (tasks[i].priority < priority) {
          break;
        }
      }

      // insert the decode task at position i
      tasks.splice(i, 0, task);

      return true;
    }
  }

  return false;
}

/**
 * Cancels a queued task and rejects
 * @param taskId - the taskId to cancel
 * @param reason - optional reason the task was rejected
 * @returns boolean - true on success, false if taskId not found
 */
function cancelTask(taskId, reason) {
  // search for this taskId
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].taskId === taskId) {
      // taskId found, remove it
      const task = tasks.splice(i, 1);

      task.deferred.reject(reason);

      return true;
    }
  }

  return false;
}

/**
 * Function to return the statistics on running web workers
 * @returns object containing statistics
 */
function getStatistics() {
  statistics.maxWebWorkers = config.maxWebWorkers;
  statistics.numWebWorkers = webWorkers.length;
  statistics.numTasksQueued = tasks.length;

  return statistics;
}

export default {
  initialize,
  loadWebWorkerTask,
  addTask,
  getStatistics,
  setTaskPriority,
  cancelTask,
  webWorkers,
  terminate,
  purgeTasks
};
