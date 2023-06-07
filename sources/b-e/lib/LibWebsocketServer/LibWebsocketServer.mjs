import util from 'node:util';
import uWS from 'uWebSockets.js';
import {
  randomUUID,
} from 'node:crypto';

export class LibWebsocketServer {
  #app = null;
  #config = null;
  #handle = null;
  #debuglog = () => {};

  constructor(config = null) {
    if (config === null) {
      throw new ReferenceError('config is undefined');
    }

    this.#config = Object.freeze(Object.assign(Object.create(null), config));
  }

  start() {
    this.#debuglog = util.debuglog('LWS');

    return new Promise((ok, fail) => {
      this.#app = uWS
        .App({})
        .ws(`${this.#config.WS_PATH}*`, {
          compression: uWS.SHARED_COMPRESSOR,
          maxPayloadLength: this.#config.WS_MAX_PAYLOAD_LENGTH,
          idleTimeout: this.#config.WS_IDLE_TIMEOUT,
          open: (ws) => {
            ws.gs = {
              id: randomUUID(),
            };

            console.log(`websocket connected: ${ws.gs.id}`);
          },
          message: (ws, message, isBinary) => {
            const ok = ws.send(message, isBinary);
          },
          close: (ws, code, message) => {
            console.log('websocket closed');
          },
        }).listen(this.#config.WS_HOST, this.#config.WS_PORT, (handle) => {
          if (handle) {
            this.#handle = handle;

            this.#debuglog(`listening on ${this.#config.WS_HOST}:${this.#config.WS_PORT}`);
            ok();
          } else {
            fail(new Error(`failed to listen to ${this.#config.WS_HOST}:${this.#config.WS_PORT}`));
          }
        });
    });
  }

  stop() {
    return new Promise((ok) => {
      if (this.#handle) {
        uWS.us_listen_socket_close(this.#handle);

        this.#handle = null;
      }

      this.#debuglog = null;

      ok();
    });
  }
}
