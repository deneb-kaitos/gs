import util from 'node:util';
import {
  randomUUID,
} from 'node:crypto';
import {
  createClient,
  commandOptions,
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
import WebSocket from 'ws';
import {
  LibWebsocketServer,
} from '@deneb-kaitos/libwebsocketserver';
import {
  WebsocketCodes,
} from '@deneb-kaitos/wscodes';
import {
  readWSConfigFromEnv,
} from '../helpers/readWSConfigFromEnv.mjs';
import {
  readRedisConfigFromEnv,
} from '../helpers/readRedisConfigFromEnv.mjs';
import {
  readStreamOptionsFromEnv,
} from '../helpers/readStreamOptionsFromEnv.mjs';
import {
  Handlers,
} from '../handlers/Handlers.mjs';

describe('redis', () => {
  // const redisClientConfig = null;
  let debuglog = null;
  const redisKeysToClean = [];
  // const redisClient = null;
  let serverId = null;
  let sinkStream = null;
  /** @type {import('redis').RedisClientType} */
  let testRedisClient = null;

  before(async () => {
    debuglog = util.debuglog('ureg:specs');
    config({
      path: 'specs/.env',
    });

    sinkStream = `${process.env.UREG_SINK_STREAM}:${randomUUID()}`;
    serverId = randomUUID();

    redisKeysToClean.push(sinkStream);

    testRedisClient = createClient(readRedisConfigFromEnv(boolFromString, 'testRedisClient'));

    await testRedisClient.connect();
  });

  after(async () => {
    await testRedisClient.unlink(redisKeysToClean.join(','));
    await testRedisClient.quit();
  });

  it('should test the server w/ websockets', async () => {
    const redisConf = readRedisConfigFromEnv(boolFromString, serverId);
    const streamOpts = readStreamOptionsFromEnv();
    const handlers = new Handlers(
      redisConf,
      streamOpts,
      sinkStream,
      serverId,
      debuglog,
    );
    const libWebsocketServer = new LibWebsocketServer(readWSConfigFromEnv(), {
      open: handlers.open,
      message: handlers.message,
      close: handlers.close,
    }, debuglog);
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const startServer = async () => {
      await handlers.start();
      return await libWebsocketServer.start();
    };
    const stopServer = async () => {
      await libWebsocketServer.stop();
      return await handlers.stop();
    };
    const expectedMessage = {
      type: 'key',
      payload: {
        value: randomUUID(),
      },
    };
    const encodedMessage = encoder.encode(JSON.stringify(expectedMessage));
    const sendMessage = () => new Promise((ok, fail) => {
      const { server } = readWSConfigFromEnv();
      const client = new WebSocket(
        `${server.WS_PROTO}://${server.WS_HOST}:${server.WS_PORT}${server.WS_PATH}`,
        {
          perMessageDeflate: false,
        },
      );

      client.on('open', () => {
        client.send(encodedMessage);
      });

      client.on('close', (code, reason) => {
        debuglog(`specs:client->close w/ ${code} and "${decoder.decode(reason)}"`);

        ok();
      });

      client.on('error', (error) => {
        debuglog('specs:client->error', error);

        fail(error);
      });

      client.on('message', (data, isBinary) => {
        debuglog('specs:client->message', data, isBinary);

        client.close(WebsocketCodes.CLOSE_NORMAL, encoder.encode('bye'));
      });
    });
    const retrieveStreamData = async () => await testRedisClient.xRead(
      commandOptions({
        isolated: true,
      }),
      [
        {
          key: sinkStream,
          id: '0-0',
        },
      ],
    );

    await startServer();
    await sendMessage();
    await stopServer();

    const retrievedRecords = await retrieveStreamData();

    const checkResults = () => new Promise((ok, fail) => {
      try {
        for (const { name, messages } of retrievedRecords) {
          expect(name).to.exist;
          expect(messages).to.exist;
          for (const m of messages) {
            debuglog('retrievedRecord.message:', m);
            const {
              message: {
                sid,
                payload,
              },
            } = m;

            expect(serverId).to.equal(sid);
            expect(JSON.parse(payload)).to.deep.equal(expectedMessage);
          }
        }
        ok();
      } catch (resultError) {
        fail(resultError);
      }
    });

    return await checkResults();
  });
});
