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
    items: {
      log: {
        url: new URL('$lib/bl/workers/log/log.mjs', import.meta.url),
        ptr: null,
      },
      communicator: {
        url: new URL('$lib/bl/workers/comm/comm.mjs', import.meta.url),
        ptr: null,
      },
    },
    workerLoadOrder: ['log', 'communicator'],
  });
  /** @type {import('xstate').Interpreter} */
  #loaderService = null;

  async load() {
    const loaderServiceConfig = {
      actions: loaderActions(this),
      delays: loaderDelays(),
      guards: loaderGuards(),
      services: loaderServices({ workers: this.#workers }),
    };
    const loaderServiceContext = {
      workerLoadOrder: this.#workers.workerLoadOrder.slice(),
      workerToLoad: null,
    };
    this.#loaderService = LoaderService({
      config: loaderServiceConfig,
      context: loaderServiceContext,
    });
    //
    this.#loaderService
      .onTransition((state) => {
        console.log(`[#loaderService].onTransition to "${state.value}"`);
      })
      .onChange((ctx) => {
        console.log('[#loaderService].onChange:', ctx);
      })
      .onDone((state) => {
        console.log('[#loaderService].onDone', state);
      })
      .onEvent((state) => {
        console.log('[#loaderService].onEvent', state);
      })
      .onSend((state) => {
        console.log('[#loaderService].onSend', state);
      })
      .onStop((state) => {
        console.log('[#loaderService].onStop', state);
      });
    //
    this.#loaderService.start();

    // this.#workers.items.communicator.ptr = new Worker(this.#workers.items.communicator.url, {
    //   type: 'module',
    // });

    // this.#workers.items.communicator.ptr.onmessage = (messageEvent = null) => {
    //   console.log('this.#communicator.onmessage', messageEvent);
    // };

    // this.#workers.items.communicator.ptr.postMessage({
    //   type: WorkerProtocolMessageTypes.INIT_REQ,
    //   payload: {
    //     proto: 'ws',
    //     host: 'localhost',
    //     port: 9000,
    //     path: '/',
    //   },
    // });

    console.log('workers:', this.#workers);
  }

  async unload() {
    if (this.#workers.items.communicator.worker) {
      this.#workers.items.communicator.worker.postMessage({
        type: WorkerProtocolMessageTypes.DIE_REQ,
        payload: null,
      });
    }
  }
}
