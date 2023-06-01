import {
  WorkerLoaderMessageTypes,
} from '$lib/bl/workers/WorkerLoaderMessageTypes.mjs';
import {
  LoaderService,
} from '$lib/bl/workers/ldr/ldr.xstate.mjs';
import LogConfig from '$lib/bl/workers/log/log.config.mjs';
import CommunicatorConfig from '$lib/bl/workers/comm/comm.config.mjs';

export class Loader {
  #workers = Object.freeze({
    items: {
      log: {
        /** @type {URL} */
        url: new URL('$lib/bl/workers/log/log.mjs', import.meta.url),
        /** @type {Worker} */
        ptr: null,
        /** @type {Object} */
        config: LogConfig,
      },
      communicator: {
        /** @type {URL} */
        url: new URL('$lib/bl/workers/comm/comm.mjs', import.meta.url),
        /** @type {Worker} */
        ptr: null,
        /** @type {Object} */
        config: CommunicatorConfig,
      },
    },
    workerLoadOrder: ['log', 'communicator'],
  });
  /** @type {import('xstate').Interpreter} */
  #loaderService = null;
  #workerMessageHandler;
  /** @type {Array} */
  #validMessageTypes = null;

  constructor() {
    // SEE: https://github.com/tc39/proposal-private-methods/issues/11#issuecomment-320108929
    this.#workerMessageHandler = this.#handleWorkerMessage.bind(this);
    this.#validMessageTypes = Object.freeze(Object.values(WorkerLoaderMessageTypes));
  }

  #handleWorkerMessage(messageEvent) {
    const {
      data: {
        type,
        payload,
      },
    } = messageEvent;

    if (this.#validMessageTypes.includes(type) === false) {
      throw new TypeError(`unknown message type: ${type}`);
    }

    this.#loaderService.send({
      type,
      payload,
    });
  }

  async load() {
    const loaderServiceConfig = {
      actions: {
        log: (ctx, event) => {
          console.log('[actions.log]', ctx, event);
        },
        listWorkers: () => {
          console.log(`workers: ${ Object.keys(this.#workers.items).join(', ')}`);
        },
        loadWorker: (ctx) => {
          const workerName = this.#workers.workerLoadOrder[ctx.loadWorkerId];

          console.log(`actions.loadWorker: "${workerName}"`);

          (this.#workers.items[workerName]).ptr = new Worker((this.#workers.items[workerName]).url, {
            type: 'module',
            credentials: 'same-origin',
            name: workerName,
          });

          (this.#workers.items[workerName]).ptr.onmessage = this.#workerMessageHandler;
        },
        configureWorker: (ctx) => {
          console.log(`actions.configureWorker::ctx.configureWorkerId: "${ctx.configureWorkerId}"`);

          const workerName = this.#workers.workerLoadOrder[ctx.configureWorkerId];

          console.log(`actions.configureWorker::workerName: "${workerName}"`);

          const {
            config,
          } = this.#workers.items[workerName];

          console.log(`actions.configureWorker::config: "${workerName}"`, config);

          (this.#workers.items[workerName]).ptr.postMessage({
            type: WorkerLoaderMessageTypes.WORKER_CONFIG_REQ,
            payload: {
              config,
            },
          });

          // this.#loaderService.send({
          //   type: WorkerProtocolMessageTypes.WORKER_CONFIG_REQ,
          //   payload: {
          //     config,
          //   },
          // });
        },
      },
      delays: {},
      guards: {
        IsAllWorkersAreLoaded: (ctx) => {
          /**
           workers: {
            log: {
              isLoaded: true,
            },
            communicator: {
              isLoaded: true,
            }
           }
          */
          
          const result = Object.values(ctx.workers)
            .map((workerInfo) => workerInfo.isLoaded)
            .reduce((result, isLoaded) => result && isLoaded, true);

          console.log(`guards.IsAllWorkersAreLoaded: ${result}`);

          return result;
        },
        IsAllWorkersAreConfigured: (ctx) => {
          /**
           workers: {
            log: {
              isLoaded: true,
              isConfigured: true,
            },
            communicator: {
              isLoaded: true,
              isConfigured: true,
            }
           }
          */
          
          const result = Object.values(ctx.workers)
            .map((workerInfo) => workerInfo.isConfigured)
            .reduce((result, isConfigured) => result && isConfigured, true);

          console.log(`guards.IsAllWorkersAreConfigured: ${result}`);

          return result;
        },
      },
      services: {},
    };
    const loaderServiceContext = {
      workerLoadOrder: this.#workers.workerLoadOrder.slice(),
    };
    this.#loaderService = LoaderService({
      config: loaderServiceConfig,
      context: loaderServiceContext,
    });
    //
    // const {
    //   unsubscribe,
    // } = this.#loaderService.subscribe((state) => {
    //   console.log('loaderService.subscribe:', state);
    // });
    //
    this.#loaderService
      .onTransition((state) => {
        console.log(`#loaderService.onTransition to "${state.value}"`);
      });
      // .onChange((ctx) => {
      //   console.log('[#loaderService].onChange:', ctx);
      // })
      // .onDone((state) => {
      //   console.log('[#loaderService].onDone', state);
      // })
      // .onEvent((state) => {
      //   console.log('[#loaderService].onEvent', state);
      // })
      // .onSend((state) => {
      //   console.log('[#loaderService].onSend', state);
      // })
      // .onStop((state) => {
      //   console.log('[#loaderService].onStop', state);
      // });
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

    // console.log('workers:', this.#workers);
  }

  async unload() {
    if (this.#workers.items.communicator.worker) {
      this.#workers.items.communicator.worker.postMessage({
        type: WorkerLoaderMessageTypes.DIE_REQ,
        payload: null,
      });
    }
  }
}
