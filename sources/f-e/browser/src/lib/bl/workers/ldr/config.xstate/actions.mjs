export const actions = (caller) => ({
  log: (ctx, event) => {
    console.log('[actions.log]', ctx, event, caller);
  },
});
