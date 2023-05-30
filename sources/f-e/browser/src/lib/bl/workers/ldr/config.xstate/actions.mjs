export const actions = () => ({
  log: (ctx, event) => {
    console.log('[actions.log]', ctx, event);
  },
});
