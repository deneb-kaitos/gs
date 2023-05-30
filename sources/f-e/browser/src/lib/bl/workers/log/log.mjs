import {
  WorkerProtocolMessageTypes,
} from '$lib/bl/workers/WorkerProtocolMessageTypes.mjs';

const processMessage = (incomingMessage = null) => {
  switch (incomingMessage.type) {
    case WorkerProtocolMessageTypes.INIT_REQ: {
      console.log(`handling the [${WorkerProtocolMessageTypes.INIT_REQ}] message`);

      postMessage({
        type: WorkerProtocolMessageTypes.INIT_RES,
        payload: null,
      });

      break;
    }
    case WorkerProtocolMessageTypes.DIE_REQ: {
      console.log(`handling the [${WorkerProtocolMessageTypes.DIE_REQ}] message`);

      postMessage({
        type: WorkerProtocolMessageTypes.DIE_RES,
        payload: null,
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
