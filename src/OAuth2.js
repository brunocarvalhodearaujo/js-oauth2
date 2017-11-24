/* global fetch */
import is from 'is'
import omit from 'lodash.omit'
import { stringify } from 'querystring'
import { Keychain } from './Keychain'
import { EventEmitter } from 'events'
import { HttpInterceptor } from './HttpInterceptor'
import fetchIntercept from 'fetch-intercept'

/**
 * @type {{ baseUrl: string, clientId: string, clientSecret: string, grantPath: string, revokePath: string, interceptRequest: boolean, keychain?: Keychain }}
 */
const DEFAULT = {
  baseUrl: null,
  clientId: null,
  clientSecret: null,
  grantPath: '/oauth2/token',
  revokePath: '/oauth2/revoke',
  interceptRequest: true,
  keychain: new Keychain()
}

/**
 * @typedef {{ access_token: string, refresh_token: string, expires_in:number, token_type: string }} Token
 */
export class OAuth2 {
  /**
   * @param {DEFAULT} params
   */
  constructor (params = {}) {
    if (!(params instanceof Object)) {
      throw new Error('Invalid argument: `config` must be an `Object`.')
    }

    const config = { ...DEFAULT, ...params }

    Object.keys(DEFAULT).forEach(key => {
      if (!config[key]) {
        throw new Error(`Missing parameter: ${key}.`)
      }
    })

    // Remove `baseUrl` trailing slash.
    if (is.equal(config.baseUrl.substr(-1), '/')) {
      config.baseUrl = config.baseUrl.slice(0, -1)
    }

    // Add `grantPath` facing slash.
    if (!is.equal(config.grantPath[0], '/')) {
      config.grantPath = `/${config.grantPath}`
    }

    // Add `revokePath` facing slash.
    if (!is.equal(config.revokePath[0], '/')) {
      config.revokePath = `/${config.revokePath}`
    }

    /**
     * @type {config}
     */
    this.config = omit(config, 'keychain')

    if (config.keychain) {
      this.keychain = config.keychain
    }

    if (config.interceptRequest) {
      this.emitter = new EventEmitter()
      this.interceptor = fetchIntercept.register(new HttpInterceptor(config.baseUrl, this.keychain, this.emitter))
    }
  }

  /**
   * Retrieves the `access_token` and stores the `response.data` on cookies using the `storage`.
   *
   * @param {{ username: string, password: string }} data - Request content, e.g., `username` and `password`.
   * @param {RequestInit} [options] - Optional configuration.
   * @returns {Promise<Token>} A response promise.
   */
  getAccessToken (data, options = {}) {
    data = {
      client_id: this.config.clientId,
      grant_type: 'password',
      ...data
    }

    if (!is.null(this.config.clientSecret)) {
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

    const request = fetch(`${this.config.baseUrl}${this.config.grantPath}`, options)
      .then(T => T.json())

    if (this.hasOwnProperty('keychain')) {
      request.then(response =>
        this.keychain.setToken(response)
          .then(() => response)
      )
    }

    return request
  }

  /**
   * Retrieves the `refresh_token` and stores the `response.data` on cookies
   * using the `storage`.
   *
   * @param {object} [data] - Request content.
   * @param {RequestInit} [options] - Optional configuration.
   * @return {Promise<Token>} A response promise.
   */
  async getRefreshToken (data, options = {}) {
    const token = await this.keychain.getToken()

    data = {
      client_id: this.config.clientId,
      grant_type: 'refresh_token',
      refresh_token: token.refresh_token,
      ...data
    }

    if (!is.null(this.config.clientSecret)) {
      data.client_secret = this.config.clientSecret
    }

    options = {
      ...options,
      headers: { 'Authorization': undefined, 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      body: stringify(data)
    }

    const request = fetch(`${this.config.baseUrl}${this.config.grantPath}`, options)
      .then(T => T.json())

    if (this.hasOwnProperty('keychain')) {
      request.then(response =>
        this.keychain.setToken(response)
          .then(() => response)
      )
    }

    return request
  }

  /**
   * Revokes the `token` and removes the stored `token` from cookies
   * using the `storage`.
   *
   * @param {Token} data - Request content.
   * @param {RequestInit} [options] - Optional configuration.
   * @return {Promise<boolean>} A response promise.
   */
  async revokeToken (data, options = {}) {
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
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      body: stringify(data)
    }

    const request = fetch(`${this.config.baseUrl}${this.config.grantPath}`, options)
      .then(T => T.json())

    if (this.hasOwnProperty('keychain')) {
      request.then(response =>
        this.keychain.removeToken(response)
          .then(() => response)
      )
    }
    return request
  }

  /**
   * @returns {Promise<boolean>}
   */
  isAuthenticated () {
    return this.keychain.getToken()
      .then(token => Boolean(typeof token === 'object' && token['access_token']))
  }

  /**
   * @param {(error:Error, data: {}) => void} callback
   */
  onError (callback) {
    if (this.config.interceptRequest) {
      this.emitter.on('oauth:error', callback)
    }
  }

  stopHttpIntercept () {
    if (this.config.interceptRequest) {
      this.interceptor.unregister()
    }
  }
}
