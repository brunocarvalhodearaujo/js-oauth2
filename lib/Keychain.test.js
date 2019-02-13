'use strict';

var _Keychain;

function _load_Keychain() {
  return _Keychain = require('./Keychain');
}

describe('Keychain', () => {
  /**
   * @type {Keychain}
   */
  let keychain;

  beforeAll(() => {
    keychain = new (_Keychain || _load_Keychain()).Keychain();
  });

  it('force implements `setToken`', () => {
    expect(keychain.setToken()).rejects.toThrowError('Method not implemented');
  });

  it('force implements `getToken`', () => {
    expect(keychain.getToken()).rejects.toThrowError('Method not implemented');
  });

  it('force implements `removeToken`', () => {
    expect(keychain.removeToken()).rejects.toThrowError('Method not implemented');
  });

  it('`getAuthorizationHeader` force implements `getToken`', () => {
    expect(keychain.getAuthorizationHeader()).rejects.toThrowError('Method not implemented');
  });
});