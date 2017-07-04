import { AbstractStorage } from './AbstractStorage'
import cookie from 'js-cookie'

export class BrowserStorage extends AbstractStorage {
  set (key, value) {
    return cookie.set(key, value)
  }

  get (key) {
    return cookie.get(key)
  }

  remove (key) {
    return cookie.get(key)
  }
}
