import {
  assign,
  createMachine,
  interpret,
} from 'xstate';

const LoaderMachine = createMachine({
  id: 'LoaderMachine',
  predictableActionArguments: true,
  preserveActionOrder: true,
  initial: 'initial',
  context: {},
  states: {
    initial: {
      entry: [
        assign({
          loadWorkerId: (ctx, evt) => {
            console.log('loadWorkerId:', ctx, evt);

            return 0;
          },
        }),
        assign({
          IsAllWorkersLoaded: () => false,
        }),
        'log',
      ],
      always: [{
        target: 'loadWorkers',
      }],
    },
    loadWorkers: {
      entry: [],
      exit: [
        assign({
          loadWorkerId: (ctx) => {
            if (ctx.loadWorkerId <= ctx.workerLoadOrder.length) {
              return ++ctx.loadWorkerId;
            }
          },
        }),
      ],
      invoke: {
        id: 'loadWorker',
        src: 'loadAWorker',
        onDone: {
          target: 'OK',
          actions: [
            // assign({ error: (ctx, evt) => evt.workerName}),
          ],
        },
        onError: {
          target: 'ER',
          actions: [
            assign({ error: (ctx, evt) => evt}),
          ],
        },
      },
      // always: [
      //   {
      //     target: 'OK',
      //     cond: 'IsAllWorkersAreLoaded',
      //   },
      //   {
      //     target: 'loadWorkers',
      //     cond: 'IsNotAllWorkersAreLoaded',
      //   },
      // ],
      // entry: [
      //   'loadAWorker',
      // ],
      // on: {
      //   WORKER_LOADED: {
      //     actions: ['log'],
      //   },
      // },
      // always: [
      //   {
      //     target: 'OK',
      //     cond: 'IsAllWorkersAreLoaded',
      //   },
      //   {
      //     target: 'loadWorkers',
      //     cond: 'IsNotAllWorkersAreLoaded',
      //   }
      // ],
    },
    ER: {
      entry: ['log'],
      type: 'final',
    },
    OK: {
      entry: ['log'],
      type: 'final',
    },
  },
});

export const LoaderService = ({ config, context }) => interpret(
  LoaderMachine
    .withConfig(config)
    .withContext(context)
);
