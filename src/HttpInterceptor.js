import is from 'is'
import { Keychain } from './Keychain'

export class HttpInterceptor {
  /**
   * @param {string} baseURL
   * @param {Keychain} keychain
   * @param {EventEmitter} emitter
   */
  constructor (baseURL, keychain, emitter) {
    if (!is.instanceof(keychain, Keychain)) {
      throw new Error('keychain must be a instance of `Keychain`')
    }
    this.baseURL = baseURL
    this.keychain = keychain
    this.emitter = emitter
    this.request = this.request.bind(this)
    this.response = this.response.bind(this)
  }

  /**
   *
   * @param {string|Request} url
   * @param {RequestInfo} config
   */
  async request (url, config) {
    if (url.includes(this.baseURL)) {
      const authorizationHeader = await this.keychain.getAuthorizationHeader()
      config['headers'] = config['headers'] || {}
      if (!config.headers.hasOwnProperty('Authorization') && authorizationHeader) {
        config.headers.Authorization = authorizationHeader
      }
    }
    return [ url, config ]
  }

  /**
   * @param {Response} response
   */
  async response (response) {
    if (response.url.includes(this.baseURL)) {
      if ((response.status === 400 || response.status === 401)) {
        const data = await response.clone().json()
        if ((data.error === 'invalid_request' || data.error === 'invalid_grant')) {
          await this.keychain.removeToken()
          this.emitter.emit('oauth:error', response)
        }
        // (response.headers && response.headers.has('www-authenticate') && response.headers.get('www-authenticate').includes('Bearer'))
        if (data.error === 'invalid_token') {
          this.emitter.emit('oauth:error', response)
        }
      }
      return response.json()
    } else {
      return response
    }
  }
}
