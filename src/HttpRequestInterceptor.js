export class HttpRequestInterceptor {
  constructor (baseURL, keychain, emitter) {
    this.baseURL = baseURL
    this.keychain = keychain
    this.emitter = emitter
    this.request = this.request.bind(this)
    this.response = this.response.bind(this)
  }

  async request (URL, config = {}) {
    const authorizationHeader = await this.keychain.getAuthorizationHeader()
    config.headers = config.headers || {}
    if (URL.includes(this.baseURL) && !config.headers.hasOwnProperty('Authorization') && authorizationHeader) {
      config.headers.Authorization = authorizationHeader
    }
    return [ URL, config ]
  }

  /**
   * @namespace
   * @param {Response} response
   */
  async response (response) {
    if (response.url.includes(this.baseURL) && (response.status === 400 || response.status === 401)) {
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
    return response
  }
}
