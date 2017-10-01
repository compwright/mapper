import hash from 'string-hash'

export { default as ObjectStore } from './ObjectStore'
export { default as LocalStorageStore } from './LocalStorageStore'

const memoizeAsync = (store = new ObjectStore()) => fn => (...args) => {
  // Create a unique key from the function arguments
  const key = hash(JSON.stringify(args))

  function callFn() {
    // Asynchronously call the function
    return Promise.resolve(fn(...args)).then(value =>
      // Asynchronously memorize the value
      Promise.resolve(store.set(key, value))
        .then(() => value)
        .catch(() => value)
    )
  }

  // Asynchronously try the store first
  return Promise.resolve(store.get(key))
    .then(value => (value === null || value === undefined ? callFn() : value))
    .catch(err => callFn())
}

export default memoizeAsync
