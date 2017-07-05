import { AbstractStorage } from './AbstractStorage'
import cookie from 'js-cookie'

export class BrowserStorage extends AbstractStorage {
  set (key, value) {
    return new Promise(resolve => resolve(cookie.set(key, value)))
  }

  remove (key) {
    return new Promise(resolve => resolve(cookie.remove(key)))
  }

  get (key) {
    return new Promise(resolve => resolve(cookie.get(key)))
  }
}
