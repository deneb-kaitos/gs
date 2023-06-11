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
import {
  readWSConfigFromEnv,
} from './helpers/readWSConfigFromEnv.mjs';
import {
  readRedisConfigFromEnv,
} from './helpers/readRedisConfigFromEnv.mjs';
import {
  readStreamOptionsFromEnv,
} from './helpers/readStreamOptionsFromEnv.mjs';

const name = 'ureg';
const serverId = randomUUID();

const debuglog = util.debuglog(name);
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
    redisClientConfig: readRedisConfigFromEnv(boolFromString, serverId),
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

  handlers = new Handlers(readRedisConfigFromEnv(boolFromString, serverId), readStreamOptionsFromEnv(), sinkStreamName, serverId, debuglog);

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
