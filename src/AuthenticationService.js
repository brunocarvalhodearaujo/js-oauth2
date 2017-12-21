import omit from 'lodash.omit'
import { Keychain } from './Keychain'
import { stringify } from 'query-string'
import { EventEmitter } from 'events'

/**
 * @type {{ debug?: boolean, baseUrl: string, clientId: string, clientSecret: string, grantPath: string, revokePath: string, keychain?: Keychain }}
 */
const DEFAULT = {
  baseUrl: null,
  clientId: null,
  clientSecret: null,
  grantPath: '/oauth2/token',
  revokePath: '/oauth2/revoke',
  keychain: new Keychain()
}

/**
 * @typedef {{ access_token: string, refresh_token: string, expires_in:number, token_type: string }} Token
 */
export class AuthenticationService {
  /**
   * @param {DEFAULT} settings
   */
  constructor (settings = {}) {
    if (!(settings instanceof Object)) {
      throw new Error('Invalid argument: `config` must be an `Object`.')
    }

    const config = {
      ...DEFAULT,
      ...settings
    }

    Object.keys(DEFAULT).forEach(key => {
      if (!config[ key ]) {
        throw new Error(`Missing parameter: ${key}.`)
      }
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

    /**
     * @type {config}
     */
    this.config = omit(config, 'keychain')
    /**
     * @type {Keychain}
     */
    this.keychain = config.keychain
    /**
     * @type {EventEmitter}
     */
    this.events = new EventEmitter()

    // bind class methods
    this.getAccessToken = this.getAccessToken.bind(this)
    this.getRefreshToken = this.getRefreshToken.bind(this)
    this.isAuthenticated = this.isAuthenticated.bind(this)
    this.revokeToken = this.revokeToken.bind(this)
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
      .then(T => T.json())
      .then(this.keychain.setToken)
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
      .then(T => T.json())
      .then(this.keychain.setToken)
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
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      body: stringify(data)
    }

    return fetch(`${this.config.baseUrl}${this.config.grantPath}`, options)
      .then(T => T.json())
      .then(this.keychain.removeToken)
  }

  /**
   * @returns {Promise<boolean>}
   */
  isAuthenticated () {
    return this.keychain.getToken()
      .then(token => Boolean(typeof token === 'object' && token['access_token']))
  }
}
