import { AbstractStorage } from './Storage/AbstractStorage'
import pickBy from 'lodash.pickby'

export class KeyChain {
  /**
   * @param {string} namespace
   * @param {AbstractStorage} storage
   */
  constructor (namespace, storage) {
    if (!(storage instanceof AbstractStorage)) {
      throw new Error('OAuthToken requires an implementation of `Storage`')
    }
    this.namespace = namespace
    this.storage = storage
  }

  setToken (data) {
    return this.storage.set(`${this.namespace}:token`, JSON.stringify(data))
  }

  removeToken () {
    return this.storage.remove(`${this.namespace}:token`)
  }

  getToken () {
    return this.storage.get(`${this.namespace}:token`).then(result => {
      if (!result) {
        return {}
      }
      const { token_type, expires_in, access_token, refresh_token } = JSON.parse(result)
      return pickBy({
        tokenType: token_type,
        expiresIn: expires_in,
        accessToken: access_token,
        refreshToken: refresh_token
      })
    })
  }

  getAuthorizationHeader () {
    return this.getToken().then(({ tokenType, accessToken }) => {
      if (!tokenType || !accessToken) {
        return undefined
      }
      return `${tokenType.charAt(0).toUpperCase() + tokenType.substr(1)} ${accessToken}`
    })
  }
}
