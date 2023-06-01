import {
  WorkerLoaderMessageTypes,
} from '$lib/bl/workers/WorkerLoaderMessageTypes.mjs';

self.CONFIG = null;

const processMessage = (incomingMessage = null) => {
  switch (incomingMessage.type) {
    case WorkerLoaderMessageTypes.INIT_REQ: {
      console.log(`handling the [${WorkerLoaderMessageTypes.INIT_REQ}] message`);

      postMessage({
        type: WorkerLoaderMessageTypes.INIT_RES,
        payload: null,
      });

      break;
    }
    case WorkerLoaderMessageTypes.DIE_REQ: {
      console.log(`handling the [${WorkerLoaderMessageTypes.DIE_REQ}] message`);

      postMessage({
        type: WorkerLoaderMessageTypes.DIE_RES,
        payload: null,
      });

      break;
    }
    case WorkerLoaderMessageTypes.WORKER_CONFIG_REQ: {
      const {
        config,
      } = incomingMessage.payload;

      console.log(`[WorkerLoaderMessageTypes.WORKER_CONFIG_REQ]`, config);

      self.CONFIG = Object.assign(Object.create(null), config);

      self.postMessage({
        type: WorkerLoaderMessageTypes.WORKER_CONFIG_RES,
        payload: {
          name: self.name,
        },
      });

      break;
    }
    default: {
      throw new TypeError('unknown type', incomingMessage);
    }
  }
}

onmessage = (messageEvent = null) => {
  if (messageEvent === null) {
    throw new ReferenceError('messageEvent is undefined');
  }

  const { data } = messageEvent;

  processMessage(data);
}

self.postMessage({
  type: WorkerLoaderMessageTypes.WORKER_CTOR,
  payload: {
    name: self.name,
  },
});
