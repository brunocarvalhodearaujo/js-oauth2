import { AbstractStorage } from './AbstractStorage'
import { AsyncStorage } from 'react-native'

export class NativeStorage extends AbstractStorage {
  async set (key, value) {
    try {
      return await AsyncStorage.setItem(key, value)
    } catch (error) {
      throw error
    }
  }

  async get (key) {
    try {
      return await AsyncStorage.getItem(key)
    } catch (error) {
      throw error
    }
  }

  async remove (key) {
    try {
      return await AsyncStorage.removeItem(key)
    } catch (error) {
      throw error
    }
  }
}
