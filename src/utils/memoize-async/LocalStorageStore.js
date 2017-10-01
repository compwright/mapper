export default class LocalStorageStore {
  constructor(localStorage, prefix = '') {
    this.localStorage = localStorage
    this.prefix = prefix
  }

  get(key) {
    return JSON.parse(this.localStorage.getItem(key + this.prefix))
  }

  set(key, value) {
    this.localStorage.setItem(key + this.prefix, JSON.stringify(value))
  }
}
