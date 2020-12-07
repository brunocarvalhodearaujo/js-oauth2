/**
 * Copyright (c) 2020-present, Bruno Carvalho de Araujo.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Keychain } from '../src/Keychain'

describe('Keychain', () => {
  let keychain: Keychain

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
