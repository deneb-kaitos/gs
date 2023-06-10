import {
  createMachine,
  spawn,
  assign,
  interpret,
} from 'xstate';
import { stop, send, sendTo } from 'xstate/lib/actions.js';
import {
  ConnectionMachineService,
} from './ConnectionMachine.mjs';

let debuglog_ptr = null;

const ConnectionMachineServiceConfig = {
  actions: {
    log: (ctx, evt) => {
      debuglog_ptr('ConnectionMachineServiceConfig::actions.log:', ctx, evt);
    },
  },
  delays: {},
  guards: {},
  services: {},
};

const ConnectionManagerMachine = createMachine({
  id: 'ConnectionManagerMachine',
  predictableActionArguments: true,
  preserveActionOrder: true,
  initial: 'running',
  context: {
    connections: {},
  },
  states: {
    running: {
      on: {
        open: {
          actions: [
            assign({
              connections: (ctx, evt) => ({
                ...ctx.connections,
                ...{
                  [evt.payload.id]: spawn(ConnectionMachineService(evt.payload.id, ConnectionMachineServiceConfig, debuglog_ptr), {
                    name: evt.payload.id,
                  }),
                },
              }),
            }),
            'log',
          ],
        },
        message: {
          actions: [
            sendTo((ctx, evt) => ctx.connections[evt.payload.id], (c, e) => ({
              type: 'message',
              payload: e.payload,
            })),
          ],
        },
        close: {
          actions: [
            stop((ctx, evt) => context.connections[evt.payload.id]),
            'log',
          ],
        },
      },
    },
  },
});

export const ConnectionManagerMachineService = (config, debuglog) => {
  debuglog_ptr = debuglog;

  return interpret(
    ConnectionManagerMachine
      .withConfig(config),
  );
};
