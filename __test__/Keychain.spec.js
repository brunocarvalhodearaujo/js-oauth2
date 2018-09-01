/* eslint-env jest */
import { Keychain } from '../src/Keychain'

describe('#Keychain', () => {
  const keychain = new Keychain()

  it('force implements `setToken`', () => {
    expect(keychain.setToken)
      .toThrow('Method not implemented')
  })

  it('force implements `getToken`', () => {
    expect(keychain.getToken)
      .toThrow('Method not implemented')
  })

  it('force implements `removeToken`', () => {
    expect(keychain.removeToken)
      .toThrow('Method not implemented')
  })
})
