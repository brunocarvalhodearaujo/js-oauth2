/**
 * Copyright (c) 2020-present, Bruno Carvalho de Araujo.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type Token = {
  access_token: string,
  refresh_token: string,
  expires_in:number,
  token_type: string
}

export class Keychain {
  setToken (value: Token): Promise<Token> {
    return Promise.reject(new Error('Not implemented'))
  }

  getToken (): Promise<Token> {
    return Promise.reject(new Error('Not implemented'))
  }

  removeToken (): Promise<void> {
    return Promise.reject(new Error('Not implemented'))
  }

  /**
   * generate authorization header using token in storage
   */
  getAuthorizationHeader (): Promise<string> {
    return this.getToken()
      .then(token => {
        if (!token || !token.token_type || !token.access_token) {
          return undefined
        }

        return `${token.token_type.charAt(0).toUpperCase()}${token.token_type.substr(1)} ${token.access_token}`
      })
  }
}
