import {
  randomUUID,
} from 'node:crypto';
import {
  raise,
  sendUpdate,
  createMachine,
  interpret,
  actions,
} from 'xstate';

let debuglog_ptr = null;

// const {
//   log,
// } = actions;

const ConnectionMachine = (id) => createMachine({
  id,
  predictableActionArguments: true,
  preserveActionOrder: true,
  initial: 'running',
  context: {},
  states: {
    running: {
      on: {
        message: {
          actions: [
            (ctx, evt) => {
              debuglog_ptr(`ConnectionMachine[${id}].running.on.message`, ctx, evt);

              const {
                payload: {
                  message,
                  isBinary,
                },
              } = evt;
              const messageObject = JSON.parse(message);

              debuglog_ptr('destructured:', messageObject, isBinary);

              // return raise(messageObject.type);
            },
            // RAISE TO SELF the key event
            // sendUpdate(),
          ],
        },
        key: {
          actions: [
            (ctx, evt) => {
              debuglog_ptr('received message type "key" with value', evt.value);
            },
          ],
        },
      },
    },
  },
});

export const ConnectionMachineService = (id, config, debuglog) => {
  debuglog_ptr = debuglog;

  return interpret(
    ConnectionMachine(id)
      .withConfig(config),
  ).start();
};
