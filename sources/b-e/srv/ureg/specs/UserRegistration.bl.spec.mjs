import util, {
  TextEncoder,
  TextDecoder,
} from 'node:util';
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
  UserRegistrationBL,
} from '../UserRegistration.bl.mjs';

describe(`${UserRegistrationBL.name}`, () => {
  globalThis.userRegistrationBL = null;
  globalThis.debuglog = null;

  before(() => {
    globalThis.debuglog = util.debuglog(`${UserRegistrationBL.name}:specs`);
    globalThis.userRegistrationBL = new UserRegistrationBL(globalThis.debuglog);
  });

  after(() => {
    globalThis.userRegistrationBL = undefined;
    globalThis.debuglog = undefined;
  });

  it('there should be a real test', async () => {
    expect(true).to.be.true;
  });
});
