import {
  createMachine,
  interpret,
} from 'xstate';

const LoaderMachine = createMachine({
  id: 'LoaderMachine',
  predictableActionArguments: true,
  initial: 'initial',
  context: {},
  states: {
    initial: {
      entry: ['log'],
    },
  },
});

export const LoaderService = ({ config, context }) => interpret(
  LoaderMachine
    .withConfig(config)
    .withContext(context)
);
