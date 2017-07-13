/* global fetch */
import { KeyChain } from './KeyChain'
import omit from 'lodash.omit'
import interceptor from 'fetch-intercept'
import { stringify } from 'querystring'
import { EventEmitter } from 'events'
import { HttpRequestInterceptor } from './HttpRequestInterceptor'

const DEFAULT = {
  baseUrl: null,
  clientId: null,
  clientSecret: null,
  grantPath: '/oauth2/token',
  revokePath: '/oauth2/revoke'
}

export default class OAuth {
  constructor (params = {}) {
    if (!(params instanceof Object)) {
      throw new Error('Invalid argument: `config` must be an `Object`.')
    }

    if (!params.hasOwnProperty('storage')) {
      throw new Error('`Storage` nao foi definido')
    }

    const config = Object.assign(DEFAULT, params)

    Object.keys(DEFAULT).forEach(key => {
      if (!config[key]) {
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

    this.keychain = new KeyChain(config.baseUrl, config.storage)
    this.config = omit(config, 'storage')
    this.emitter = new EventEmitter()
    this.interceptor = interceptor.register(new HttpRequestInterceptor(config.baseUrl, this.keychain, this.emitter))
  }

  /**
   * Retrieves the `access_token` and stores the `response.data` on cookies
   * using the `storage`.
   *
   * @param {object} data - Request content, e.g., `username` and `password`.
   * @param {object} options - Optional configuration.
   * @return {Promise<object>} A response promise.
   */
  getAccessToken (data, options = {}) {
    data = Object.assign({ client_id: this.config.clientId, grant_type: 'password' }, data)

    if (this.config.clientSecret !== null) {
      data.client_secret = this.config.clientSecret
    }

    options = Object.assign({
      headers: { 'Authorization': undefined, 'Content-Type': 'application/x-www-form-urlencoded' }
    }, options, { method: 'POST', body: stringify(data) })

    return fetch(`${this.config.baseUrl}${this.config.grantPath}`, options)
      .then(response => response.json())
      .then(response => this.keychain.setToken(response).then(() => response))
      .then(T => new Promise((resolve, reject) => {
        !T.hasOwnProperty('access_token')
          ? resolve(T)
          : reject(new Error('usuario ou senha invalidos'))
      }))
  }

  /**
   * Retrieves the `refresh_token` and stores the `response.data` on cookies
   * using the `storage`.
   *
   * @param {object} data - Request content.
   * @param {object} options - Optional configuration.
   * @return {Promise<object>} A response promise.
   */
  async getRefreshToken (data, options = {}) {
    const { refreshToken } = await this.keychain.getToken()
    data = Object.assign({
      client_id: this.config.clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }, data)

    if (this.config.clientSecret !== null) {
      data.client_secret = this.config.clientSecret
    }

    options = Object.assign({
      headers: { 'Authorization': undefined, 'Content-Type': 'application/x-www-form-urlencoded' }
    }, options, { method: 'POST', body: stringify(data) })

    return fetch(`${this.config.baseUrl}${this.config.grantPath}`, options)
      .then(response => response.json())
      .then(response => this.keychain.setToken(response).then(() => response))
  }

  /**
   * Revokes the `token` and removes the stored `token` from cookies
   * using the `storage`.
   *
   * @param {object} data - Request content.
   * @param {object} options - Optional configuration.
   * @return {Promise<object>} A response promise.
   */
  async revokeToken (data, options) {
    const { refreshToken, accessToken } = await this.keychain.getToken()

    data = Object.assign({
      client_id: this.config.clientId,
      token: refreshToken || accessToken,
      token_type_hint: refreshToken ? 'refresh_token' : 'access_token'
    }, data)

    if (this.config.clientSecret !== null) {
      data.client_secret = this.config.clientSecret
    }

    options = Object.assign({
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }, options, { method: 'POST', body: stringify(data) })

    return fetch(`${this.config.baseUrl}${this.config.revokePath}`, options)
      .then(response => response.json())
      .then(response => this.keychain.removeToken().then(() => response))
  }

  /**
   * @returns {Promise<boolean>}
   */
  isAuthenticated () {
    return this.keychain.getToken()
      .then(({ accessToken }) => Boolean(accessToken))
  }

  onError (callback) {
    this.emitter.on('oauth:error', callback)
  }

  stopHttpInterception () {
    this.interceptor.unregister()
  }
}
