import { Observable } from 'rxjs/Observable';

export default function observe(observable, total) {
  let completed = 0,
    errors = 0

  return Observable.create(progress => {
    observable.subscribe({
      next: (item) => {
        (item instanceof Error) ? ++errors : ++completed
        progress.next({ completed, errors, total })
      },
      error: (error) => progress.error(error),
      complete: () => progress.complete()
    })
  })
}
