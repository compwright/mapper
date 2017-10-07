import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/fromPromise'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/mergeAll'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/concatMap'
import 'rxjs/add/operator/delay'
import 'rxjs/add/operator/catch'
import { addressFilter } from '../../filters/address.filter'
import immutableSet from '../immutable/object/set'
import { hasAddress, hasCoordinates } from '../validation'

export default class MarkerGeocoder {
  constructor(geocodeService) {
    this._geocode = geocodeService
  }

  geocode(collection) {
    // Find the markers that need to be geocoded
    const geocode = collection.markers.filter(
      marker =>
        typeof marker.$index === 'number' &&
        marker.$geocodeStatus !== 'pending' &&
        hasAddress(marker) &&
        !hasCoordinates(marker)
    )

    if (geocode.length === 0) return {}

    // Set the geocoding status for the UI
    geocode.forEach(marker =>
      collection.set(immutableSet(marker, '$geocodeStatus', 'pending'))
    )

    // Just observe the marker indexes, since the user could change an address field at any time
    const markerIndexes = geocode.map(marker => marker.$index)

    const operations = Observable.of(markerIndexes)
      .mergeAll()
      .concatMap(value => Observable.of(value).delay(250)) // rate limit at 2 per second
      .map($index => {
        // marker => 'street, city, state zip'
        const address = addressFilter(collection.markers[$index])

        return Observable.fromPromise(this._geocode(address))
          .map(result => {
            // Discard result if the address changed
            if (result.address !== address) {
              return immutableSet(collection.markers[$index], {
                $geocodeStatus: 'refresh'
              })
            }

            return immutableSet(collection.markers[$index], {
              lat: result.lat,
              lng: result.lng,
              $geocodeStatus: 'successful'
            })
          })
          .catch(error => {
            if (error.message === google.maps.GeocoderStatus.ZERO_RESULTS) {
              error.marker = immutableSet(collection.markers[$index], {
                $geocodeStatus: 'error',
                $geocodeError: error.message
              })
              return Observable.of(error)
            } else {
              error.marker = collection.markers[$index]
              return Observable.throw(error)
            }
          })
      })
      .mergeAll()

    operations.subscribe({
      next: marker => {
        collection.set(marker instanceof Error ? marker.marker : marker)
      },
      error: () => {
        // Since the observable stopped due to an error, we need to
        // reset the status of any markers that didn't get geocoded
        // so they will be picked up on the next geocode run
        collection.markers
          .filter(({ $geocodeStatus }) => $geocodeStatus === 'pending')
          .forEach(marker =>
            collection.set(immutableSet(marker, '$geocodeStatus', 'refresh'))
          )
      }
    })

    return {
      length: geocode.length,
      operations
    }
  }
}
