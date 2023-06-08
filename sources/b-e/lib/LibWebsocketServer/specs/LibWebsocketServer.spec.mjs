import util, {
  TextEncoder,
  TextDecoder,
} from 'node:util';
import {
  randomUUID,
} from 'node:crypto';
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
import WebSocket from 'ws';
import {
  LibWebsocketServer,
} from '../LibWebsocketServer.mjs';

describe('LibWebsocketServer', () => {
  let libWebsocketServer = null;
  let libWebsocketServerConfig = null;
  let libWebsocketServerHandlers = null;
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const debuglog = util.debuglog(`${LibWebsocketServer.name}:specs`);

  before(async () => {
    config({
      path: 'specs/.env',
    });

    libWebsocketServerConfig = {
      server: {
        WS_PROTO: process.env.WS_PROTO,
        WS_HOST: process.env.WS_HOST,
        WS_PORT: parseInt(process.env.WS_PORT, 10),
        WS_PATH: process.env.WS_PATH,
        WS_MAX_PAYLOAD_LENGTH: parseInt(process.env.WS_MAX_PAYLOAD_LENGTH, 10),
        WS_IDLE_TIMEOUT: parseInt(process.env.WS_IDLE_TIMEOUT, 10),
      },
    };

    libWebsocketServerHandlers = {
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

    libWebsocketServer = new LibWebsocketServer(libWebsocketServerConfig, libWebsocketServerHandlers);

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
    const undefinedConfig = null;

    try {
      // eslint-disable-next-line no-unused-vars
      wss = new LibWebsocketServer(undefinedConfig);
    } catch (referenceError) {
      expect(referenceError).to.be.instanceOf(ReferenceError);
    }
  });

  it('should fail on undefined handlers', async () => {
    let wss = null;
    const irrelevantConfig = {};
    const undefinedHandlers = null;

    try {
      // eslint-disable-next-line no-unused-vars
      wss = new LibWebsocketServer(irrelevantConfig, undefinedHandlers);
    } catch (referenceError) {
      expect(referenceError).to.be.instanceOf(ReferenceError);
    }
  });

  it('client should connect/disconnect', () => new Promise((ok, fail) => {
    const {
      server,
    } = libWebsocketServerConfig;
    const client = new WebSocket(
      `${server.WS_PROTO}://${server.WS_HOST}:${server.WS_PORT}${server.WS_PATH}`,
      {
        perMessageDeflate: false,
      },
    );

    client.on('open', () => {
      client.close(1000, encoder.encode('bye'));
    });

    client.on('close', (code, reason) => {
      debuglog(`client->close w/ ${code} and "${decoder.decode(reason)}"`);

      ok();
    });

    client.on('error', (error) => {
      fail(error);
    });
  }));
});
