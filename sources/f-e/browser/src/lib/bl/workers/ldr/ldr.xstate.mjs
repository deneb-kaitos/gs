import {
  createMachine,
  actions,
  interpret,
} from 'xstate';

const LoaderMachine = createMachine({
  predictableActionArguments: true,
});

export const LoaderService = interpret(LoaderMachine);
