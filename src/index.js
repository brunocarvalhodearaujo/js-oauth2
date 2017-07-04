/* global fetch */
import { merge, forEach } from 'lodash'
import { stringify } from 'query-string'
import { Token } from './Token'
import { HttpRequestInterceptor } from './HttpRequestInterceptor'
import interceptor from 'fetch-intercept'
import { EventEmitter } from 'events'

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

    // Extend default configuration.
    const config = merge(DEFAULT, params)

    // Check if all required keys are set.
    forEach([ 'baseUrl', 'clientId', 'grantPath', 'revokePath', 'storage' ], key => {
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
    this.config = config
    this.token = new Token(config.storage)
    this.emitter = new EventEmitter()
    this.interceptor = interceptor.register(new HttpRequestInterceptor(config.baseUrl, this.token, this.emitter))
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
    data = merge({ client_id: this.config.clientId, grant_type: 'password' }, data)

    if (this.config.clientSecret !== null) {
      data.client_secret = this.config.clientSecret
    }

    options = merge({
      headers: { 'Authorization': undefined, 'Content-Type': 'application/x-www-form-urlencoded' }
    }, options, { method: 'POST', body: stringify(data) })

    return fetch(`${this.config.baseUrl}${this.config.grantPath}`, options)
      .then(response => response.json())
      .then(response => {
        this.token.setToken(response)
        return response
      })
  }

  /**
   * Retrieves the `refresh_token` and stores the `response.data` on cookies
   * using the `storage`.
   *
   * @param {object} data - Request content.
   * @param {object} options - Optional configuration.
   * @return {Promise<object>} A response promise.
   */
  getRefreshToken (data, options = {}) {
    const { refreshToken } = this.token.getToken()
    data = merge({
      client_id: this.config.clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }, data)

    if (this.config.clientSecret !== null) {
      data.client_secret = this.config.clientSecret
    }

    options = merge({
      headers: { 'Authorization': undefined, 'Content-Type': 'application/x-www-form-urlencoded' }
    }, options, { method: 'POST', body: stringify(data) })

    return fetch(`${this.config.baseUrl}${this.config.grantPath}`, options)
      .then(response => response.json())
      .then(response => {
        this.token.setToken(response)
        return response
      })
  }

  /**
   * Revokes the `token` and removes the stored `token` from cookies
   * using the `storage`.
   *
   * @param {object} data - Request content.
   * @param {object} options - Optional configuration.
   * @return {Promise<object>} A response promise.
   */
  revokeToken (data, options) {
    const { refreshToken, accessToken } = this.token.getToken()

    data = merge({
      client_id: this.config.clientId,
      token: refreshToken || accessToken,
      token_type_hint: refreshToken ? 'refresh_token' : 'access_token'
    }, data)

    if (this.config.clientSecret !== null) {
      data.client_secret = this.config.clientSecret
    }

    options = merge({
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }, options, { method: 'POST', body: stringify(data) })

    return fetch(`${this.config.baseUrl}${this.config.revokePath}`, options)
      .then(response => response.json())
      .then(response => {
        this.token.removeToken()
        return response
      })
  }

  isAuthenticated () {
    const { accessToken } = this.token.getToken()
    return Boolean(accessToken)
  }

  onError (callback) {
    this.emitter.on('oauth:error', callback)
  }

  stopHttpInterception () {
    this.interceptor.unregister()
  }
}
