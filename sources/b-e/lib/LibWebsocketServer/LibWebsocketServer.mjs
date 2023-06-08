import util from 'node:util';
import uWS from 'uWebSockets.js';

const DISABLE_FORCED_CLOSE = 0;

export class LibWebsocketServer {
  #app = null;
  #config = null;
  #handlers = null;
  #handle = null;
  // eslint-disable-next-line class-methods-use-this
  #debuglog = null;

  constructor(config = null, handlers = null, debuglog = null) {
    if (config === null) {
      throw new ReferenceError('config is undefined');
    }

    this.#config = Object.freeze(Object.assign(Object.create(null), config));

    if (handlers === null) {
      throw new ReferenceError('handlers are undefined');
    }

    this.#handlers = Object.freeze(handlers);

    if (debuglog) {
      this.#debuglog = debuglog;
    }
  }

  start() {
    this.#debuglog = util.debuglog(this.constructor.name);

    return new Promise((ok, fail) => {
      this.#app = uWS
        .App({})
        .ws(`${this.#config.server.WS_PATH}*`, {
          // NB: we need no compression since we operate on binary messages
          compression: uWS.DISABLED,
          maxPayloadLength: this.#config.server.WS_MAX_PAYLOAD_LENGTH,
          idleTimeout: this.#config.server.WS_IDLE_TIMEOUT,
          maxLifetime: DISABLE_FORCED_CLOSE,
          sendPingsAutomatically: true,
          open: this.#handlers.open,
          message: this.#handlers.message,
          close: this.#handlers.close,
        }).listen(this.#config.server.WS_HOST, this.#config.server.WS_PORT, (handle) => {
          if (handle) {
            this.#handle = handle;

            this.#debuglog(`listening on ${this.#config.server.WS_HOST}:${this.#config.server.WS_PORT}`);
            ok();
          } else {
            fail(new Error(`failed to listen to ${this.#config.server.WS_HOST}:${this.#config.server.WS_PORT}`));
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
