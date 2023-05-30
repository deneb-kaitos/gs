import {
  WorkerProtocolMessageTypes,
} from '$lib/bl/workers/WorkerProtocolMessageTypes.mjs';
import {
  LoaderService,
} from '$lib/bl/workers/ldr/ldr.xstate.mjs';

const workerUrls = Object.freeze({
  communicatorURL: new URL('$lib/bl/workers/comm/comm.mjs', import.meta.url),
});

export class Loader {
  #loaderService = null;
  #communicator = null;

  constructor() {
    this.#loaderService = LoaderService;

    this.#loaderService.start();
  }


  async load() {
    this.#communicator = new Worker(workerUrls.communicatorURL, {
      type: 'module',
    });

    this.#communicator.onmessage = (messageEvent = null) => {
      console.log('this.#communicator.onmessage', messageEvent);
    };

    this.#communicator.postMessage({
      type: WorkerProtocolMessageTypes.INIT_REQ,
      payload: {
        proto: 'ws',
        host: 'localhost',
        port: 9000,
        path: '/',
      },
    });

    console.log('this.#communicator:', this.#communicator);
  }

  async unload() {
    if (this.#communicator) {
      this.#communicator.postMessage({
        type: WorkerProtocolMessageTypes.DIE_REQ,
        payload: null,
      });
    }
  }
}
