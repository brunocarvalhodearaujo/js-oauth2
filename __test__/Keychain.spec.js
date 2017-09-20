/* eslint-env jest */
import { Keychain } from '../src/Keychain'

describe('#Keychain', () => {
  const keychain = new Keychain()

  it('force implements `setToken`', () => {
    expect(keychain.setToken)
      .toThrow('`Keychain` model does not implement `setToken()`')
  })

  it('force implements `getToken`', () => {
    expect(keychain.getToken)
      .toThrow('`Keychain` model does not implement `getToken()`')
  })

  it('force implements `removeToken`', () => {
    expect(keychain.removeToken)
      .toThrow('`Keychain` model does not implement `removeToken()`')
  })
})
