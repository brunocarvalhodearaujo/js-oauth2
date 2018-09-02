/**
 * @typedef {{ access_token: string, refresh_token: string, expires_in:number, token_type: string }} Token
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
   * @returns {Promise<string>}
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
