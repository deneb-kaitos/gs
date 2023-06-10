import util from 'node:util';
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
  boolFromString,
} from '../boolFromString.mjs';

describe('boolFromString', () => {
  let debuglog = null;

  before(() => {
    debuglog = util.debuglog('helpers:specs');
  });

  after(() => {
    debuglog = null;
  });

  it('should resolve true from "true"', async () => {
    const trueString = 'true';

    expect(boolFromString(trueString)).to.be.true;
  });

  it('should resolve false from "false"', async () => {
    const falseString = 'false';

    expect(boolFromString(falseString)).to.be.false;
  });

  it('should resolve from space-padded input', async () => {
    const falseString = ' false';

    expect(boolFromString(falseString)).to.be.false;
  });

  it('should fail with incorrect input', async () => {
    const incorrectStrings = [
      {
        value: undefined,
        expectedError: ReferenceError,
      },
      {
        value: null,
        expectedError: ReferenceError,
      },
    ];

    for await (const incorrectString of incorrectStrings) {
      try {
        boolFromString(incorrectString.value);
      } catch (error) {
        expect(error).to.be.instanceOf(incorrectString.expectedError);

        debuglog(`done probing '${incorrectString.value}' with expected ${incorrectString.expectedError.name}`);
      }
    }
  });
});
