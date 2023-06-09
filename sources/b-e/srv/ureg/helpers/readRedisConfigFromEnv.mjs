export const readRedisConfigFromEnv = (boolFromString, srvId) => ({
  socket: {
    port: parseInt(process.env.REDIS_SOCKET_PORT, 10),
    host: process.env.REDIS_SOCKET_HOST,
    family: parseInt(process.env.REDIS_SOCKET_PROTOCOL_FAMILY, 10),
    path: process.env.REDIS_SOCKET_PATH,
    connectTimeout: parseInt(process.env.REDIS_SOCKET_CONN_TIMEOUT, 10),
    noDelay: boolFromString(process.env.REDIS_SOCKET_NODELAY),
    keepAlive: boolFromString(process.env.REDIS_SOCKET_KEEP_ALIVE),
    tls: boolFromString(process.env.REDIS_SOCKET_TLS),
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
  },
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_USERPASS,
  name: `${process.env.REDIS_CLIENT_NAME}:${srvId}`,
  database: parseInt(process.env.REDIS_DB_ID, 10),
  modules: [],
  scripts: {},
  functions: [],
  commandsQueueMaxLength: 0,
  disableOfflineQueue: false,
  readonly: false,
  legacyMode: false,
  isolationPoolOptions: {},
  pingInterval: parseInt(process.env.REDIS_PING_INTERVAL, 10),
});
