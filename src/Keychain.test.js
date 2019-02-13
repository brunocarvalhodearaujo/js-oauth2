import { Keychain } from './Keychain'

describe('Keychain', () => {
  /**
   * @type {Keychain}
   */
  let keychain

  beforeAll(() => {
    keychain = new Keychain()
  })

  it('force implements `setToken`', () => {
    expect(keychain.setToken()).rejects.toThrowError('Method not implemented')
  })

  it('force implements `getToken`', () => {
    expect(keychain.getToken()).rejects.toThrowError('Method not implemented')
  })

  it('force implements `removeToken`', () => {
    expect(keychain.removeToken()).rejects.toThrowError('Method not implemented')
  })

  it('`getAuthorizationHeader` force implements `getToken`', () => {
    expect(keychain.getAuthorizationHeader()).rejects.toThrowError('Method not implemented')
  })
})
