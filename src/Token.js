import { AbstractStorage } from './storage/AbstractStorage'
import { pickBy } from 'lodash'

export class Token {
  constructor (storage) {
    if (!(storage instanceof AbstractStorage)) {
      throw new Error('OAuthToken requires an implementation of `Storage`')
    }
    this.storage = storage
  }

  setToken (data) {
    if (data) {
      data = JSON.stringify(data)
    }
    this.storage.set('token', data)
    return data
  }

  removeToken () {
    return this.storage.remove('token')
  }

  getToken () {
    const token = this.storage.get('token')
    if (!token) {
      return {}
    }
    const { token_type, expires_in, access_token, refresh_token } = JSON.parse(token)
    return pickBy({
      tokenType: token_type,
      expiresIn: expires_in,
      accessToken: access_token,
      refreshToken: refresh_token
    })
  }

  getAuthorizationHeader () {
    const { tokenType, accessToken } = this.getToken()
    if (!tokenType || !accessToken) {
      return undefined
    }
    return `${tokenType.charAt(0).toUpperCase() + tokenType.substr(1)} ${accessToken}`
  }
}
