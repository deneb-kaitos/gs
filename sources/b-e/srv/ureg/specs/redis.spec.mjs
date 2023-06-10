import util from 'node:util';
import {
  createClient,
} from 'redis';
import {
  config,
} from 'dotenv';
import {
  boolFromString,
} from '@deneb-kaitos/helpers/boolFromString.mjs';
import {
  describe,
  before,
  after,
  it,
} from 'mocha';
import {
  expect,
} from 'chai';

describe('redis', () => {
  globalThis.redisOpts = null;
  globalThis.debuglog = null;

  before(() => {
    config({
      path: 'specs/.env',
    });

    globalThis.debuglog = util.debuglog('ureg:specs');

    globalThis.redisOpts = {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT, 10),
      maxRetries: parseInt(process.env.REDIS_MAX_RETRIES, 10),
      auth: process.env.REDIS_AUTH,
      db: parseInt(process.env.REDIS_DB, 10),
      autoConnect: boolFromString(process.env.REDIS_AUTO_CONNECT),
      doNotSetClientName: boolFromString(process.env.REDIS_DONT_SET_CLIENT_NAME),
      doNotRunQuitOnEnd: boolFromString(process.env.REDIS_DONT_RUN_QUIT_ON_END),
      reconnectTimeout: parseInt(process.env.REDIS_RECONNECT_TIMEOUT, 10),
      connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT, 10),
    };
  });

  it('should connect to redis', async () => {
    const client = createClient({
      socket: {
        port: globalThis.redisOpts.port,
        host: globalThis.redisOpts.host,
        family: 4,
        path: null,
        connectTimeout: 1000,
        noDelay: true,
        keepAlive: true,
        tls: false,
        reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
      },
      username: '',
      password: '',
      name: '',
      database: '',
      modules: [],
      scripts: {},
      functions: [],
      commandsQueueMaxLength: 0,
      disableOfflineQueue: false,
      readonly: false,
      legacyMode: false,
      isolationPoolOptions: {},
      pingInterval: 0,
    });

    await client.connect();

    globalThis.debuglog(`ping: ${await client.ping()}`);
    globalThis.debuglog(`time: ${await client.time()}`);

    await client.quit();
  });
});
