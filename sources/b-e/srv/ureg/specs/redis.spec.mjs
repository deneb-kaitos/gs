import util from 'node:util';
import {
  randomUUID,
} from 'node:crypto';
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

config({
  path: 'specs/.env',
});

const sinkStream = `${process.env.UREG_SINK_STREAM}:${randomUUID()}`;

describe('redis', () => {
  globalThis.redisClientConfig = null;
  globalThis.debuglog = null;
  global.redisKeysToClean = [];

  /** @type {import('redis').RedisClientType || null} */
  global.redisClient = null;

  before(async () => {
    globalThis.debuglog = util.debuglog('ureg:specs');

    global.redisKeysToClean.push(sinkStream);

    globalThis.redisClientConfig = Object.freeze({
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
      name: process.env.REDIS_CLIENT_NAME,
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

    global.redisClient = createClient(globalThis.redisClientConfig);

    await global.redisClient.connect();
  });

  after(async () => {
    await global.redisClient.unlink(global.redisKeysToClean.join(','));
    await global.redisClient.quit();

    global.redisClient = undefined;
  });

  // eslint-disable-next-line no-async-promise-executor
  it(`should write to "${sinkStream}" stream`, () => new Promise(async (ok, fail) => {
    const message = {
      sid: randomUUID(), // websocket server id
      cid: randomUUID(), // websocket client id
      // payload: {},
    };
    const options = {
      NOMKSTREAM: false,
      TRIM: {
        strategy: process.env.UREG_SINK_STREAM_TRIM_STRATEGY,
        strategyModifier: process.env.UREG_SINK_STREAM_TRIM_STRATEGY_MOD,
        threshold: parseInt(process.env.UREG_SINK_STREAM_TRIM_STRATEGY_THRESHOLD, 10),
        limit: parseInt(process.env.UREG_SINK_STREAM_TRIM_STRATEGY_LIMIT, 10),
      },

    };
    const AUTOGENERATED_ID = '*';

    let xAddResult = null;

    try {
      await global.redisClient.executeIsolated(async (isolatedClient) => {
        xAddResult = await isolatedClient.xAdd(sinkStream, AUTOGENERATED_ID, message, options);
      });

      globalThis.debuglog({
        xAddResult,
      });

      ok();
    } catch (err) {
      fail(err);
    }
  }));
});
