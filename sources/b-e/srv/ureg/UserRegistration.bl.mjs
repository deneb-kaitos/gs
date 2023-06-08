import {
  randomUUID,
} from 'node:crypto';
import {
  WebsocketCodes,
} from '@deneb-kaitos/wscodes';

export class UserRegistrationBL {
  #debuglog = null;
  #decoder = new TextDecoder();
  #encoder = new TextEncoder();
  /** @type {WeakMap} */
  #clientsProperties = null;
  /** @type {Map} */
  #clients = null;

  constructor(debuglog) {
    this.#debuglog = debuglog;
    this.#clientsProperties = new WeakMap();
    this.#clients = new Map();
  }

  /** @property {import('uWebSockets.js').WebSocket} ws */
  #killClient(ws, wsCode, closeMessage) {
    const { id } = this.#clientsProperties.get(ws);

    ws.end(wsCode, this.#encoder.encode(closeMessage));

    this.#clients.delete(id);
  }

  // eslint-disable-next-line class-methods-use-this
  open(ws) {
    const id = randomUUID();

    this.#clientsProperties.set(ws, {
      id,
    });
    this.#clients.set(id, ws);

    this.#debuglog(`websocket connected: ${id}`);
  }

  // eslint-disable-next-line class-methods-use-this
  message(ws, message, isBinary) {
    if (isBinary === false) {
      this.#debuglog(`message.isBinary: ${isBinary}`);

      this.#killClient(ws, WebsocketCodes.UNSUPPORTED_PAYLOAD, 'message must be binary');

      return;
    }

    this.#debuglog((this.#clientsProperties.get(ws)).id, message, isBinary);
  }

  // eslint-disable-next-line class-methods-use-this
  close(ws, code, message) {
    this.#debuglog(`websocket [${ws.gs.id}] closed with code [${code}] and message:`, this.#decoder.decode(message));
  }
}
