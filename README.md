js-oauth2
=========

[![npm version](https://badge.fury.io/js/js-oauth2.svg)](http://badge.fury.io/js/js-oauth2)
[![License](https://img.shields.io/npm/l/js-oauth2.svg)](https://www.npmjs.com/package/js-oauth2) 
[![Dependency Status](https://david-dm.org/brunocarvalhodearaujo/js-oauth2.svg?style=flat-square)](https://david-dm.org/brunocarvalhodearaujo/js-oauth2)
[![devDependency Status](https://david-dm.org/brunocarvalhodearaujo/js-oauth2/dev-status.svg?style=flat-square)](https://david-dm.org/brunocarvalhodearaujo/js-oauth2#info=devDependencies)
[![npm](https://img.shields.io/npm/dt/js-oauth2.svg)](https://www.npmjs.com/package/js-oauth2)
[![coverage report](https://gitlab.com/brunocarvalho/js-oauth2/badges/2.x/coverage.svg)](https://gitlab.com/brunocarvalho/js-oauth2/commits/2.x)
[![Known Vulnerabilities](https://snyk.io/test/github/sffc/js-oauth2/badge.svg)](https://snyk.io/test/github/sffc/js-oauth2)
[![npm version](http://img.shields.io/npm/v/js-oauth2.svg?style=flat)](https://npmjs.org/package/js-oauth2 "View this project on npm")

This library is a port of angular-oauth2 to vanilla JS and fetch. Currently, this library only uses the password
credential grant, i.e, using a combination (username, password), we'll request an access
token (using `grant_type=password`) wich, in case of success, will return a response such as:

````json
{
  "access_token": "foobar",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "foobiz"
}
````

Internally we'll automatically store it as a cookie and it will be used in every request adding an
Authorization header: Authorization: 'Bearer foobar'.


### Instalation

choose your preferred method:

  - npm: `npm install --save js-oauth2`
  - yarn: `yarn add js-oauth2`


### Usage

initialize library:

````js
import { AuthenticationService, AbstractKeychain, httpRequestInterceptor } from 'js-oauth2'
import cookie from 'js-cookie'

class Keychain extends AbstractKeychain {
  /**
   * @param {Token} value
   * @returns {Promise<void>}
   */
  setToken (value) {
    return new Promise((resolve) => {
      resolve(cookie.set('token', value))
    })
  }

  /**
   * @returns {Promise<Token>}
   */
  getToken () {
    return new Promise((resolve) => {
      resolve(cookie.getJSON('token') || {})
    })
  }

  /**
   * @returns {Promise<void>}
   */
  removeToken () {
    return new Promise((resolve) => {
      resolve(cookie.remove('token'))
    })
  }
}

const oauth = new AuthenticationService({
  baseUrl: '/api',
  clientId: 'b921b25ebe3ee70c6b1',
  clientSecret: '8f4d45d9a363d922b2eb7',
  keychain: new Keychain()
})

httpRequestInterceptor(oauth) // only if you need http request interception
````

#### API

Check authentication status:

```js
/**
 * Verifies if the `user` is authenticated or not based on the `token`
 * cookie.
 * @return {Promise<boolean>}
 */
oauth.isAuthenticated()
```

Get an access token:

```js
/**
 * Retrieves the `access_token` and stores the `response.data` on cookies
 * using the `OAuthToken`.
 * @param {object} user - Object with `username` and `password` properties.
 * @param {object} config - Optional configuration object sent to `POST`.
 * @return {Promise} A response promise.
 */

oauth.getAccessToken(user, options)
```

Refresh access token:

```js
/**
 * Retrieves the `refresh_token` and stores the `response.data` on cookies
 * using the `OAuthToken`.
 * @return {Promise} A response promise.
 */

oauth.getRefreshToken()
```

Revoke access token:

```js
/**
 * Revokes the `token` and removes the stored `token` from cookies
 * using the `OAuthToken`.
 * @return {Promise} A response promise.
 */

oauth.revokeToken()
```

Catch OAuth errors and do something with them (optional):

````js
/**
 * @param {Response} response
 */

async function onError (response)  {
  const data = await response.clone().json()
  if (data.error === 'invalid_grant') {
    return
  }
  // Refresh token when a `invalid_token` error occurs.
  if (data.error === 'invalid_token') {
    return oauth.getRefreshToken()
  }
  // Redirect to `/login` with the `error_reason`.
  return window.location(`/login?error_reason=${data.error}`)
}

auth.onError(onError)
````

**NOTE**: An *event* `oauth:error` will be sent everytime a `onError` is emitted:

* `{ status: 400, data: { error: 'invalid_request' } }`
* `{ status: 400, data: { error: 'invalid_grant' } }`
* `{ status: 401, data: { error: 'invalid_token' } }`
* `{ status: 401, headers: { 'www-authenticate': 'Bearer realm="example"' } }`


## References to create project
  - [angular-oauth2](https://www.npmjs.com/package/angular-oauth2)
  - [Resouce Owner Password Credential Grant](https://tools.ietf.org/html/rfc6749#section-4.3)
