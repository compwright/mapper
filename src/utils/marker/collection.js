import { Subject } from 'rxjs/Subject'
import immutableSplice from '../immutable/array/splice'

export default class MarkerCollection extends Subject {
  constructor(markers = []) {
    super()
    this.markers = markers
  }

  set(marker) {
    this.markers = immutableSplice(this.markers, marker.$index, 1, marker)
    this.next(this.markers)
    return marker
  }
}
