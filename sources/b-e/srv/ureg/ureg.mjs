#!/usr/bin/env -S NODE_ENV=production NODE_DEBUG=ureg NODE_OPTIONS=--experimental-permission NODE_OPTIONS='--allow-fs-read=./ureg.mjs' node

/**
 * kill -s HUP <processid> -- force to restart the server
 */

import process from 'node:process';
import util from 'node:util';
import {
  randomUUID,
} from 'node:crypto';
import {
  config,
} from 'dotenv';
import {
  boolFromString,
} from '@deneb-kaitos/helpers/boolFromString.mjs';
import {
  LibWebsocketServer,
} from '@deneb-kaitos/libwebsocketserver';
import {
  Handlers,
} from './handlers/Handlers.mjs';

const name = 'ureg';
const serverId = randomUUID();

const debuglog = util.debuglog(name);
const readWSConfigFromEnv = () => ({
  server: {
    WS_PROTO: process.env.WS_PROTO,
    WS_HOST: process.env.WS_HOST,
    WS_PORT: parseInt(process.env.WS_PORT, 10),
    WS_PATH: process.env.WS_PATH,
    WS_MAX_PAYLOAD_LENGTH: parseInt(process.env.WS_MAX_PAYLOAD_LENGTH, 10),
    WS_IDLE_TIMEOUT: parseInt(process.env.WS_IDLE_TIMEOUT, 10),
  },
});
const readRedisConfigFromEnv = (srvId) => ({
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
const readStreamOptionsFromEnv = () => ({
  NOMKSTREAM: false,
  TRIM: {
    strategy: process.env.UREG_SINK_STREAM_TRIM_STRATEGY,
    strategyModifier: process.env.UREG_SINK_STREAM_TRIM_STRATEGY_MOD,
    threshold: parseInt(process.env.UREG_SINK_STREAM_TRIM_STRATEGY_THRESHOLD, 10),
    limit: parseInt(process.env.UREG_SINK_STREAM_TRIM_STRATEGY_LIMIT, 10),
  },

});
let libWebsocketServer = null;
let sinkStreamName = null;
let handlers = null;
const startServer = async () => {
  debuglog('.startServer');

  config({
    path: '.env',
  });

  sinkStreamName = process.env.UREG_SINK_STREAM;

  debuglog({
    redisClientConfig: readRedisConfigFromEnv(serverId),
  });
  debuglog({
    redisStreamOpts: readStreamOptionsFromEnv(),
  });
  debuglog({
    sinkStreamName,
  });
  debuglog({
    serverId,
  });

  handlers = new Handlers(readRedisConfigFromEnv(serverId), readStreamOptionsFromEnv(), sinkStreamName, serverId, debuglog);

  await handlers.start();

  debuglog({
    handlers,
  });

  libWebsocketServer = new LibWebsocketServer(readWSConfigFromEnv(), {
    open: handlers.open,
    message: handlers.message,
    close: handlers.close,
  }, debuglog);

  await libWebsocketServer.start();

  debuglog({
    libWebsocketServer,
  });

  debuglog('DONE .startServer');
};
const stopServer = async () => {
  debuglog('.stopServer');

  await libWebsocketServer.stop();
  await handlers.stop();

  handlers = null;
  libWebsocketServer = null;

  debuglog('DONE .stopServer');
};
const handleSignal = async (signal) => {
  switch (signal) {
    case 'SIGINT': {
      await stopServer();

      return true;
    }
    case 'SIGHUP': {
      await stopServer();
      await startServer();

      return false;
    }
    default: {
      debuglog(`don't know how to handle ${signal}`);

      return false;
    }
  }
};

process.on('SIGINT', handleSignal);
process.on('SIGHUP', handleSignal);

await startServer();
