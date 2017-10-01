import { Observable } from 'rxjs/Observable';

export default function observe(observable, total) {
  let completed = 0,
    errors = 0

  return Observable.create(progress => {
    observable.subscribe({
      next: () => progress.next({ completed: ++completed, errors, total }),
      catch: () => progress.next({ completed, errors: ++errors, total }),
      completed: () => progress.completed()
    })
  })
}
