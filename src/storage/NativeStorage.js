import { AbstractStorage } from './AbstractStorage'
import { AsyncStorage } from 'react-native'

export class NativeStorage extends AbstractStorage {
  set (key, value) {
    return new Promise((resolve, reject) => {
      AsyncStorage.setItem(key)
        .then(resolve)
        .catch(reject)
    })
  }

  get (key) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem(key)
        .then(resolve)
        .catch(reject)
    })
  }

  remove (key) {
    return new Promise((resolve, reject) => {
      AsyncStorage.removeItem(key)
        .then(resolve)
        .catch(reject)
    })
  }
}
