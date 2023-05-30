export const guards = () => ({
  IsAllWorkersAreLoaded: (ctx, evt) => {
    console.log('guards.IsAllWorkersAreLoaded', ctx, evt);

    return false;
  },
  IsNotAllWorkersAreLoaded: (ctx, evt) => {
    console.log('guards.IsNotAllWorkersAreLoaded', ctx, evt);

    return true;
  },
});
