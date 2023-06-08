#!/usr/bin/env -S NODE_ENV=production NODE_DEBUG=LibWebsocketServer*,ureg NODE_OPTIONS=--experimental-permission NODE_OPTIONS='--allow-fs-read=./ureg.mjs' node
// NODE_OPTIONS='--allow-fs-read=./ureg.mjs'

/**
 * kill -s HUP <processid> -- force to restart the server
 */

import process from 'node:process';
import {
  randomUUID,
} from 'node:crypto';
import util, {
  TextDecoder,
} from 'node:util';
import {
  config,
} from 'dotenv';
import {
  LibWebsocketServer,
} from '@deneb-kaitos/libwebsocketserver';

globalThis.name = 'ureg';

const decoder = new TextDecoder();
const debuglog = util.debuglog(globalThis.name);
const libWebsocketServerHandlers = {
  open: (ws) => {
    ws.gs = {
      id: randomUUID(),
    };

    debuglog(`websocket connected: ${ws.gs.id}`);
  },
  message: (ws, message, isBinary) => {
    debuglog(ws.gs.id, message, isBinary);
  },
  close: (ws, code, message) => {
    debuglog(`websocket [${ws.gs.id}] closed with code [${code}] and message:`, decoder.decode(message));
  },
};
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
  config({
    path: '.env',
  });

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
