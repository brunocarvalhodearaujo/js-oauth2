/**
 * Copyright (c) 2020-present, Bruno Carvalho de Araujo.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Keychain, Token } from './Keychain'
import { stringify } from 'querystring'
import { EventEmitter } from 'events'
import omit from 'lodash.omit'

type Options = {
  debug: boolean,
  baseUrl: string,
  clientId: string,
  clientSecret: string,
  grantPath: string,
  revokePath: string,
  keychain: Keychain,
}

const DEFAULT: Partial<Options> = {
  baseUrl: null,
  clientId: null,
  clientSecret: null,
  grantPath: '/oauth2/token',
  revokePath: '/oauth2/revoke',
  keychain: new Keychain()
}

export class AuthenticationService {
  public config: Options
  public keychain: Keychain
  public events: EventEmitter = new EventEmitter()

  constructor (settings: Partial<Options> = {}) {
    if (!(settings instanceof Object)) {
      throw new Error('Invalid argument: `config` must be an `Object`.')
    }

    const config = Object.assign(DEFAULT, settings)

    Object.keys(omit(DEFAULT, 'clientSecret', 'keychain')).forEach(key => {
      if (!config[key]) throw new Error(`Missing parameter: ${key}.`)
    })

    // Remove `baseUrl` trailing slash.
    if (config.baseUrl.substr(-1) === '/') {
      config.baseUrl = config.baseUrl.slice(0, -1)
    }

    // Add `grantPath` facing slash.
    if (config.grantPath[0] !== '/') {
      config.grantPath = `/${config.grantPath}`
    }

    // Add `revokePath` facing slash.
    if (config.revokePath[0] !== '/') {
      config.revokePath = `/${config.revokePath}`
    }

    this.config = omit(config, 'keychain') as Options
    this.keychain = config.keychain
  }

  /**
   * Retrieves the `access_token` and stores the `response.data` on cookies using the `storage`.
   *
   * @param data Request content, e.g., `username` and `password`.
   * @param options Optional configuration.
   * @returns A response promise.
   */
  public getAccessToken = (data: { username: string, password: string, [key:string]: any }, options: Partial<RequestInit> = {}): Promise<Token> => {
    data = {
      client_id: this.config.clientId,
      grant_type: 'password',
      ...data
    }

    if (this.config.clientSecret !== null) {
      data.client_secret = this.config.clientSecret
    }

    options = {
      ...options,
      headers: {
        'Authorization': undefined,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      body: stringify(data)
    }

    return fetch(`${this.config.baseUrl}${this.config.grantPath}`, options)
      .then(response => {
        if (response.status !== 200) {
          return Promise.reject(response)
        }

        return response.json()
      })
      .then(this.keychain.setToken)
  }

  /**
   * Retrieves the `refresh_token` and stores the `response.data` on cookies
   * using the `storage`.
   *
   * @param data Request content.
   * @param options Optional configuration.
   * @return A response promise.
   */
  public getRefreshToken = async (data: Partial<Token> & { [key:string]: any }, options: Partial<RequestInit> = {}): Promise<Token> => {
    try {
      const token = await this.keychain.getToken()

      data = {
        client_id: this.config.clientId,
        grant_type: 'refresh_token',
        refresh_token: token.refresh_token,
        ...data
      }

      if (this.config.clientSecret !== null) {
        data.client_secret = this.config.clientSecret
      }

      options = {
        ...options,
        headers: {
          'Authorization': undefined,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        body: stringify(data)
      }

      return fetch(`${this.config.baseUrl}${this.config.grantPath}`, options)
        .then(response => {
          if (response.status !== 200) {
            return Promise.reject(response)
          }

          return response.json()
        })
        .then(this.keychain.setToken)
    } catch (err) {
      return Promise.reject(err)
    }
  }

  /**
   * Revokes the `token` and removes the stored `token` from cookies
   * using the `storage`.
   *
   * @param data - Request content.
   * @param options - Optional configuration.
   * @return A response promise.
   */
  public revokeToken = async (data: Partial<Token> & { [key:string]: any }, options: Partial<RequestInit> = {}): Promise<void> => {
    try {
      const token = await this.keychain.getToken()

      data = {
        client_id: this.config.clientId,
        token: token.refresh_token || token.access_token,
        token_type_hint: token.refresh_token ? 'refresh_token' : 'access_token',
        ...data
      }

      if (this.config.clientSecret !== null) {
        data.client_secret = this.config.clientSecret
      }

      options = {
        ...options,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        body: stringify(data)
      }

      return fetch(`${this.config.baseUrl}${this.config.revokePath}`, options)
        .then(T => T.json())
        .then(this.keychain.removeToken)
        .catch(this.keychain.removeToken)
    } catch (err) {
      return Promise.reject(err)
    }
  }

  public isAuthenticated = (): Promise<boolean> => {
    return this.keychain.getToken()
      .then(token => Boolean(typeof token === 'object' && token['access_token']))
  }
}
