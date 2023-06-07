import {
  describe,
  before,
  after,
  it,
} from 'mocha';
import {
  expect,
} from 'chai';
import {
  config,
} from 'dotenv';
import {
  LibWebsocketServer,
} from '../LibWebsocketServer.mjs';

describe('LibWebsocketServer', () => {
  let libWebsocketServer = null;
  let libWebsocketServerConfig = null;

  before(async () => {
    config({
      path: 'specs/.env',
    });

    libWebsocketServerConfig = {
      WS_PROTO: process.env.WS_PROTO,
      WS_HOST: process.env.WS_HOST,
      WS_PORT: parseInt(process.env.WS_PORT, 10),
      WS_PATH: process.env.WS_PATH,
      WS_MAX_PAYLOAD_LENGTH: parseInt(process.env.WS_MAX_PAYLOAD_LENGTH, 10),
      WS_IDLE_TIMEOUT: parseInt(process.env.WS_IDLE_TIMEOUT, 10),
    };

    libWebsocketServer = new LibWebsocketServer(libWebsocketServerConfig);

    return await libWebsocketServer.start();
  });

  after(async () => {
    if (libWebsocketServer) {
      await libWebsocketServer.stop();

      libWebsocketServer = null;
    }
  });

  it('should fail on undefined config', async () => {
    let wss = null;

    try {
      // eslint-disable-next-line no-unused-vars
      wss = new LibWebsocketServer(null);
    } catch (referenceError) {
      expect(referenceError).to.be.instanceOf(ReferenceError);
    }
  });
});
