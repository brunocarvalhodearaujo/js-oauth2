import OAuth2, { AbstractKeychain } from './oauth2'
import cookie from 'js-cookie'

// implementation of storage
class Keychain extends AbstractKeychain {
  setToken (value) {
    return new Promise((resolve) => resolve(cookie.set('token', value)))
  }

  getToken () {
    return new Promise((resolve) => resolve(cookie.getJSON('token')))
  }

  removeToken () {
    return new Promise((resolve) => resolve(cookie.remove('token')))
  }
}

const config = {
  baseUrl: 'http://api.example.com',
  clientId: 'test',
  clientSecret: 'test',
  grantPath: '/oauth/token',
  revokePath: '/oauth/revoke',
  keychain: new Keychain()
}

const oauth = new OAuth2(config)

oauth.getAccessToken({ username: 'example@email.com', password: 'p@ssword' })
  .then(console.log)
  .then(() => oauth.getRefreshToken())
  .then(console.log)
  .then(() => oauth.getRefreshToken())
  .then(console.log)
