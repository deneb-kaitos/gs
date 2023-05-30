import {
  WorkerProtocolMessageTypes,
} from '$lib/bl/workers/WorkerProtocolMessageTypes.mjs';
import {
  LoaderService,
} from '$lib/bl/workers/ldr/ldr.xstate.mjs';
import {
  actions as loaderActions,
} from './config.xstate/actions.mjs';
import {
  delays as loaderDelays,
} from './config.xstate/delays.mjs';
import {
  guards as loaderGuards,
} from './config.xstate/guards.mjs';
import {
  services as loaderServices,
} from './config.xstate/services.mjs';

export class Loader {
  #workers = Object.freeze({
    communicator: {
      url: new URL('$lib/bl/workers/comm/comm.mjs', import.meta.url),
      worker: null,
    },
  });
  #loaderService = null;

  async load() {
    const loaderServiceContext = {};
    const loaderServiceConfig = {
      actions: loaderActions(),
      delays: loaderDelays(),
      guards: loaderGuards(),
      services: loaderServices(),
    };
    this.#loaderService = LoaderService({
      config: loaderServiceConfig,
      context: loaderServiceContext,
    }).start();

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
