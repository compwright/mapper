export default function observe(promises) {
  let completed = 0,
    errors = 0,
    total = promises.length

  return Observable.of(promises)
    .mergeMap(Observable.fromPromise)
    .catch(error => Observable.of({ error }))
    .map(result => {
      if (result.error) {
        error++
      } else {
        completed++
      }
      return { completed, errors, total }
    })
}
