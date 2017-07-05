export class AbstractStorage {
  /**
   * @param {string} key
   * @param {any} value
   * @returns {Promise<void>}
   */
  set (key, value) {}

  /**
   * @param {string} key
   * @returns {Promise<void>}
   */
  remove (key) {}

  /**
   * @param {string} key
   * @returns {Promise<string>}
   */
  get (key) {}
}
