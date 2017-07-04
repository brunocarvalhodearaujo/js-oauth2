export class AbstractStorage {
  set (key, value) {
    throw new Error('need implements')
  }

  get (key) {
    throw new Error('need implements')
  }

  remove (key) {
    throw new Error('need implements')
  }
}
