/**
 * @typedef Token
 * @property {string} access_token
 * @property {string} refresh_token
 * @property {number} expires_in
 * @property {string} token_type
 */
export class Keychain {
  /**
   * @param {Token} value
   * @returns {Promise<Token>}
   */
  setToken (value) {
    return Promise.reject(new Error('Method not implemented'))
  }

  /**
   * @returns {Promise<Token>}
   */
  getToken () {
    return Promise.reject(new Error('Method not implemented'))
  }

  /**
   * @returns {Promise<void>}
   */
  removeToken () {
    return Promise.reject(new Error('Method not implemented'))
  }

  /**
   * generate authorization header using token in storage
   *
   * @returns {Promise<string|void>}
   */
  getAuthorizationHeader () {
    return this.getToken()
      .then(token => {
        if (!token || !token.token_type || !token.access_token) {
          return undefined
        }

        return `${token.token_type.charAt(0).toUpperCase()}${token.token_type.substr(1)} ${token.access_token}`
      })
  }
}
