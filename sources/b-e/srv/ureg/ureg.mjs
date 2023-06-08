#!/usr/bin/env -S NODE_ENV=production NODE_DEBUG=LibWebsocketServer*,ureg NODE_OPTIONS=--experimental-permission NODE_OPTIONS='--allow-fs-read=./ureg.mjs' node
// NODE_OPTIONS='--allow-fs-read=./ureg.mjs'

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
  UserRegistrationBL,
} from './UserRegistration.bl.mjs';

globalThis.name = 'ureg';

const debuglog = util.debuglog(globalThis.name);
let userRegistrationBL = null;
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
  userRegistrationBL = new UserRegistrationBL(debuglog);

  config({
    path: '.env',
  });

  const libWebsocketServerHandlers = {
    open: userRegistrationBL.open,
    message: userRegistrationBL.message,
    close: userRegistrationBL.close,
  };

  libWebsocketServer = new LibWebsocketServer(readConfigFromEnv(), libWebsocketServerHandlers, debuglog);

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
