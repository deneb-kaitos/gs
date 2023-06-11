export const readStreamOptionsFromEnv = () => ({
  NOMKSTREAM: false,
  TRIM: {
    strategy: process.env.UREG_SINK_STREAM_TRIM_STRATEGY,
    strategyModifier: process.env.UREG_SINK_STREAM_TRIM_STRATEGY_MOD,
    threshold: parseInt(process.env.UREG_SINK_STREAM_TRIM_STRATEGY_THRESHOLD, 10),
    limit: parseInt(process.env.UREG_SINK_STREAM_TRIM_STRATEGY_LIMIT, 10),
  },
});
