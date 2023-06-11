export const readWSConfigFromEnv = () => ({
  server: {
    WS_PROTO: process.env.WS_PROTO,
    WS_HOST: process.env.WS_HOST,
    WS_PORT: parseInt(process.env.WS_PORT, 10),
    WS_PATH: process.env.WS_PATH,
    WS_MAX_PAYLOAD_LENGTH: parseInt(process.env.WS_MAX_PAYLOAD_LENGTH, 10),
    WS_IDLE_TIMEOUT: parseInt(process.env.WS_IDLE_TIMEOUT, 10),
  },
});
