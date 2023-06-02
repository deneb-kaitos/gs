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
  LibWebsocketServer,
} from '../LibWebsocketServer.mjs';

describe('LibWebsocketServer', () => {
  let libWebsocketServer = null;

  before(() => {
    libWebsocketServer = new LibWebsocketServer();

    libWebsocketServer.start();
  });

  after(() => {
    if (libWebsocketServer) {
      libWebsocketServer.stop();

      libWebsocketServer = undefined;
    }
  });

  it('is a dummy test', async () => {
    expect(true).to.be.true;
  });
});
