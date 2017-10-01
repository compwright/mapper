export default class ObjectStore {
  constructor(store = {}, prefix = '') {
    this.store = store
    this.prefix = prefix
  }

  get(key) {
    return this.store[key + this.prefix]
  }

  set(key, value) {
    this.store[key + this.prefix] = value
  }
}
