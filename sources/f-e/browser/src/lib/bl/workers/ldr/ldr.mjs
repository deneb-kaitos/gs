import {
  WorkerProtocolMessageTypes,
} from '$lib/bl/workers/WorkerProtocolMessageTypes.mjs';
import {
  LoaderService,
} from '$lib/bl/workers/ldr/ldr.xstate.mjs';


export class Loader {
  #workers = Object.freeze({
    communicator: {
      url: new URL('$lib/bl/workers/comm/comm.mjs', import.meta.url),
      worker: null,
    },
  });
  #loaderService = null;

  constructor() {
    this.#loaderService = LoaderService;

    this.#loaderService.start();
  }


  async load() {
    this.#workers.communicator.worker = new Worker(this.#workers.communicator.url, {
      type: 'module',
    });

    this.#workers.communicator.worker.onmessage = (messageEvent = null) => {
      console.log('this.#communicator.onmessage', messageEvent);
    };

    this.#workers.communicator.worker.postMessage({
      type: WorkerProtocolMessageTypes.INIT_REQ,
      payload: {
        proto: 'ws',
        host: 'localhost',
        port: 9000,
        path: '/',
      },
    });

    console.log('workers:', this.#workers);
  }

  async unload() {
    if (this.#workers.communicator.worker) {
      this.#workers.communicator.worker.postMessage({
        type: WorkerProtocolMessageTypes.DIE_REQ,
        payload: null,
      });
    }
  }
}
