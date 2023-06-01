import {
  assign,
  createMachine,
  interpret,
} from 'xstate';
import {
  WorkerLoaderMessageTypes,
} from '../WorkerLoaderMessageTypes.mjs';

const LoaderMachine = createMachine({
  id: 'LoaderMachine',
  predictableActionArguments: true,
  preserveActionOrder: true,
  initial: 'INITIAL',
  context: {},
  states: {
    INITIAL: {
      entry: [
        'listWorkers',
        assign({
          loadWorkerId: 0,
          configureWorkerId: 0,
          workers: (ctx) => {
            const result = ctx.workerLoadOrder
              .reduce(
                (acc, workerName) => {
                  acc[workerName] = {
                    isLoaded: false,
                    isConfigured: false,
                  };

                  return acc;
                }, Object.create(null),
              );

            return result;
          },
        }),
      ],
      always: [
        {
          target: 'LOAD_WORKERS',
        }
      ],
    },
    LOAD_WORKERS: {
      entry: [
        'loadWorker',
      ],
      on: {
        [WorkerLoaderMessageTypes.WORKER_CTOR]: {
          actions: [
            assign({
              workers: (ctx, evt) => {
                const {
                  payload: {
                    name,
                  },
                } = evt;
                const result = structuredClone(ctx.workers);

                result[name] = {
                  ...result[name],
                  ...{
                    isLoaded: true,
                  },
                };

                return result;
              },
              loadWorkerId: (ctx) => ctx.loadWorkerId += 1,
            }),
            'log',
          ],
          target: 'CHECK_ALL_WORKERS_LOADED',
        },
      },
    },
    CHECK_ALL_WORKERS_LOADED: {
      always: [
        {
          target: 'CONFIGURE_WORKERS',
          cond: 'IsAllWorkersAreLoaded',
        },
        {
          target: 'LOAD_WORKERS',
        },
      ],
    },
    ER_LOAD_WORKER: {
      type: 'final',
    },
    CONFIGURE_WORKERS: {
      entry: [
        'configureWorker',
      ],
      on: {
        [WorkerLoaderMessageTypes.WORKER_CONFIG_RES]: {
          actions: [
            assign({
              workers: (ctx, evt) => {
                const {
                  payload: {
                    name,
                  },
                } = evt;

                const result = structuredClone(ctx.workers);

                result[name] = {
                  ...result[name],
                  ...{
                    isConfigured: true,
                  },
                };

                return result;
              },
              configureWorkerId: (ctx) => ctx.configureWorkerId += 1,
            }),
            'log',
          ],
          target: 'CHECK_ALL_WORKERS_CONFIGURED',
        },
      },
    },
    CHECK_ALL_WORKERS_CONFIGURED: {
      always: [
        {
          target: 'OK',
          cond: 'IsAllWorkersAreConfigured',
        },
        {
          target: 'CONFIGURE_WORKERS',
        },
      ],
    },
    OK: {
      type: 'final',
    },
    ER_CONFIGURE_WORKER: {
      type: 'final',
    },
  },
});

export const LoaderService = ({ config, context }) => interpret(
  LoaderMachine
    .withConfig(config)
    .withContext(context)
);
