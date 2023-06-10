import util from 'node:util';
import {
  describe,
  before,
  it,
} from 'mocha';
import {
  expect,
} from 'chai';
import {
  WebsocketCodes,
} from '../WebsocketCodes.mjs';

describe('WebsocketCodes', () => {
  const EXPECTED_NUMBER_OF_ITEMS = 15;

  let debuglog = null;

  before(() => {
    debuglog = util.debuglog('WebsocketCodes:specs');
  });

  it(`should have ${EXPECTED_NUMBER_OF_ITEMS} items`, async () => {
    expect(Object.keys(WebsocketCodes).length === EXPECTED_NUMBER_OF_ITEMS);
  });
});
