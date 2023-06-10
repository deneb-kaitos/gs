#!/usr/bin/env -S NODE_ENV=production NODE_DEBUG=ureg NODE_OPTIONS=--experimental-permission NODE_OPTIONS='--allow-fs-read=./ureg.mjs' node

/**
 * kill -s HUP <processid> -- force to restart the server
 */

import process from 'node:process';
import util from 'node:util';
import {
  config,
} from 'dotenv';
import {
  LibWebsocketServer,
} from '@deneb-kaitos/libwebsocketserver';
import {
  Handlers,
} from './handlers/Handlers.mjs';

const name = 'ureg';

const debuglog = util.debuglog(name);
const readConfigFromEnv = () => ({
  server: {
    WS_PROTO: process.env.WS_PROTO,
    WS_HOST: process.env.WS_HOST,
    WS_PORT: parseInt(process.env.WS_PORT, 10),
    WS_PATH: process.env.WS_PATH,
    WS_MAX_PAYLOAD_LENGTH: parseInt(process.env.WS_MAX_PAYLOAD_LENGTH, 10),
    WS_IDLE_TIMEOUT: parseInt(process.env.WS_IDLE_TIMEOUT, 10),
  },
});
let libWebsocketServer = null;
const startServer = async () => {
  const handlers = new Handlers(debuglog);

  config({
    path: '.env',
  });

  libWebsocketServer = new LibWebsocketServer(readConfigFromEnv(), {
    open: handlers.open,
    message: handlers.message,
    close: handlers.close,
  }, debuglog);

  return await libWebsocketServer.start();
};
const stopServer = async () => await libWebsocketServer.stop();
const handleSignal = async (signal) => {
  switch (signal) {
    case 'SIGINT': {
      await libWebsocketServer.stop();

      break;
    }
    case 'SIGHUP': {
      debuglog('restarting the server');

      await stopServer();
      await startServer();

      debuglog('server has been restarted');
      break;
    }
    default: {
      debuglog(`don't know how to handle ${signal}`);

      break;
    }
  }
};

process.on('SIGINT', handleSignal);
process.on('SIGHUP', handleSignal);

await startServer();
