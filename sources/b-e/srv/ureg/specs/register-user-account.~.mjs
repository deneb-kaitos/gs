import util, {
  TextEncoder,
  TextDecoder,
} from 'node:util';
import {
  randomUUID,
} from 'node:crypto';
import {
  config,
} from 'dotenv';
import WebSocket from 'ws';
import {
  LibWebsocketServer,
} from '@deneb-kaitos/libwebsocketserver';
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
  WebsocketCodes,
} from '@deneb-kaitos/wscodes';
import {
  ConnectionManagerMachineService,
} from '../bl/ConnectionManagerMachine.mjs';

describe('register user account', () => {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let debuglog = null;
  let libWebsocketServer = null;
  let libWebsocketServerConfig = null;
  let libWebsocketServerHandlers = null;
  let connectionManagerMachineService = null;
  /** @type {import('xstate').MachineSchema} */
  let connectionManagerMachineServiceCfg = null;

  before(async () => {
    config({
      path: 'specs/.env',
    });

    debuglog = util.debuglog('rua:specs');
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
    /** @type {import('xstate').MachineSchema} */
    connectionManagerMachineServiceCfg = {
      actions: {
        log: (ctx, evt) => {
          debuglog('actions.log:', ctx, evt);
        },
      },
      delays: {},
      guards: {},
      services: {},
    };
    connectionManagerMachineService = ConnectionManagerMachineService(connectionManagerMachineServiceCfg, debuglog);
    libWebsocketServerHandlers = {
      open: (ws) => {
        ws.gs = {
          id: randomUUID(),
        };

        connectionManagerMachineService.send({
          type: 'open',
          payload: {
            id: ws.gs.id,
          },
        });
      },
      message: (ws, message, isBinary) => {
        connectionManagerMachineService.send({
          type: 'message',
          payload: {
            id: ws.gs.id,
            message: decoder.decode(message),
            isBinary,
          },
        });
      },
      close: (ws, code, message) => {
        debuglog(`close: websocket [${ws.gs.id}] closed with code [${code}] and message:`, decoder.decode(message));
      },
    };
    libWebsocketServer = new LibWebsocketServer(
      libWebsocketServerConfig,
      libWebsocketServerHandlers,
      debuglog,
    );

    connectionManagerMachineService.start();

    return await libWebsocketServer.start();
  });

  after(async () => {
    if (libWebsocketServer) {
      await libWebsocketServer.stop();
    }
  });

  it('should create a new user account', () => new Promise((ok, fail) => {
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
      // client.close(WebsocketCodes.CLOSE_NORMAL, encoder.encode('bye'));
      const message = encoder.encode(JSON.stringify(
        {
          type: 'key',
          payload: {
            value: randomUUID(),
          },
        },
      ));
      client.send(message);
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
