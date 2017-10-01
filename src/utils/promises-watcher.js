// Watch the progress of an array of promises
export default function watch(promises, notify) {
  let completed = 0,
    errors = 0,
    total = promises.length

  notify({ total })

  for (let promise of promises) {
    promise
      .then(result => {
        completed++
        notify({ completed, errors, total })
        return result
      })
      .catch(error => {
        errors++
        notify({ completed, errors, total })
        return error
      })
  }
}
