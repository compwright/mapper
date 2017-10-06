import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/fromPromise'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/mergeAll'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/concatMap'
import 'rxjs/add/operator/delay'
import 'rxjs/add/operator/catch'
import debounce from 'lodash.debounce'
import { addressFilter } from '../filters/address.filter'
import watchProgress from '../utils/promises-watcher'
import observeProgress from '../utils/progress-observer'
import immutableSplice from '../utils/immutable/array/splice'
import immutableClone from '../utils/immutable/array/clone'
import immutableSet from '../utils/immutable/object/set'
import immutableCloneObject from '../utils/immutable/object/clone'
import ClusterManager from '../utils/cluster/manager'
import { hasSomeKeys, hasAllKeys } from '../utils/validation'

const addressFields = ['address', 'city', 'state', 'zip']
const coordinatesFields = ['lat', 'lng']
const hasAddress = hasAllKeys(...addressFields)
const hasSomeAddress = hasSomeKeys(...addressFields)
const hasCoordinates = hasAllKeys(...coordinatesFields)

export function controller(geocoder, $rootScope, $timeout) {
  const $ctrl = this
  const $applyDebounced = debounce($rootScope.$apply.bind($rootScope), 100)

  this.markers = []
  this.clusters = []

  const clusterManager = new ClusterManager(this.markers)
  clusterManager.subscribe(clusters => {
    this.clusters = clusters
    $applyDebounced()
  })

  this.state = {
    step: 'cut', // 'input', 'cut'
    print: false
  }

  this.attachNotifications = $notificationOverlayController => {
    this.addNotification = notification => {
      $notificationOverlayController.push(notification)
      $applyDebounced()
    }
  }

  const setMarkers = (markers = []) => {
    this.markers = markers
    clusterManager.markers = this.markers
  }

  this.setMarker = marker => {
    setMarkers(immutableSplice(this.markers, marker.$index, 1, marker))
  }

  this.updateMarker = ($event, $index, $change) => {
    const changes = immutableSet($change, { $index })
    const needsGeocode = hasSomeAddress($change)
    const marker = immutableSet(this.markers[$index], changes)

    if (needsGeocode) {
      marker.$geocodeStatus = 'refresh'
      delete marker.lat
      delete marker.lng
    }

    this.setMarker(marker)

    if (needsGeocode) {
      this.geocode()
    }
  }

  this.addCluster = polygon => {
    const clusterIndex = clusterManager.add(polygon)

    // Refresh the cluster markers if the polygon is edited or moved
    polygon.onCoordinatesChanged(function() {
      clusterManager.refresh(clusterIndex)
      $applyDebounced()
    })
  }

  this.geocode = debounce(() => {
    // Find the markers that need to be geocoded
    const geocode = this.markers.filter(
      marker =>
        typeof marker.$index === 'number' &&
        marker.$geocodeStatus !== 'pending' &&
        hasAddress(marker) &&
        !hasCoordinates(marker)
    )

    if (geocode.length === 0) return

    // Set the geocoding status for the UI
    geocode.forEach(marker =>
      this.setMarker(immutableSet(marker, '$geocodeStatus', 'pending'))
    )

    // Just observe the marker indexes, since the user could change an address field at any time
    const markerIndexes = geocode.map(marker => marker.$index)

    const operations = Observable.of(markerIndexes)
      .mergeAll()
      .concatMap(value => Observable.of(value).delay(250)) // rate limit at 2 per second
      .map($index => {
        // marker => 'street, city, state zip'
        const address = addressFilter(this.markers[$index])

        return Observable.fromPromise(geocoder(address))
          .map(geocodeResult => {
            // Discard result if the address changed
            if (geocodeResult.address !== address) {
              return immutableSet(
                this.markers[$index],
                '$geocodeStatus',
                'refresh'
              )
            }

            return immutableSet(this.markers[$index], {
              lat: geocodeResult.lat,
              lng: geocodeResult.lng,
              $geocodeStatus: 'successful'
            })
          })
          .catch(error => {
            if (error.message === google.maps.GeocoderStatus.ZERO_RESULTS) {
              error.marker = immutableSet(this.markers[$index], {
                $geocodeStatus: 'error',
                $geocodeError: error.message
              })
              return Observable.of(error)
            } else {
              error.marker = this.markers[$index]
              return Observable.throw(error)
            }
          })
      })
      .mergeAll()

    operations.subscribe({
      next: marker => {
        this.setMarker(marker instanceof Error ? marker.marker : marker)
      },
      error: error => {
        // Since the observable stopped due to an error, we need to
        // reset the status of any markers that didn't get geocoded
        // so they will be picked up on the next geocode run
        this.markers
          .filter(({ $geocodeStatus }) => $geocodeStatus === 'pending')
          .forEach(marker =>
            this.setMarker(immutableSet(marker, '$geocodeStatus', 'refresh'))
          )

        this.addNotification({
          type: 'danger',
          title: 'Geocode error:',
          content: error.message,
          actions: [
            {
              title: 'Retry',
              text: 'Retry',
              closeNotification: true,
              onClick: this.geocode.bind(this)
            }
          ]
        })
      },
      complete: () => $applyDebounced()
    })

    this.addNotification({
      component: 'geocode-progress',
      title: 'Geocoding addresses, please wait...',
      allowClose: false,
      progress: observeProgress(operations, geocode.length)
    })

    $applyDebounced()

    return operations
  }, 250)
}

controller.$inject = ['geocoder', '$rootScope', '$timeout']

export const template = `
  <nav class="navbar navbar-default navbar-static-top">
    <div class="container-fluid row">
      <div class="navbar-header col-sm-12">
        <span class="navbar-brand">Mapper</span>
        <div class="btn-group navbar-btn" ng-model="$ctrl.state.step" bs-radio-group ng-hide="$ctrl.state.print">
          <label class="btn btn-default">
            <input type="radio" class="btn btn-default" value="input">
            <i class="fa fa-table"></i> List
          </label>
          <label class="btn btn-default">
            <input type="radio" class="btn btn-default" value="cut">
            <i class="fa fa-scissors" aria-hidden="true"></i> Split
          </label>
        </div>
        <div class="navbar-btn pull-right" ng-show="$ctrl.state.step === 'cut'">
          <button type="button" class="btn btn-default" ng-model="$ctrl.state.print"
              bs-checkbox ng-disabled="$ctrl.clusters.length === 0">
            <i class="fa fa-print"></i> Print Preview
          </button>
        </div>
      </div>
    </div>
  </nav>

  <spreadsheet-view ng-show="$ctrl.state.step === 'input' && !$ctrl.state.print" rows="$ctrl.markers"
      on-change="$ctrl.updateMarker($event, $index, $change)"></spreadsheet-view>

  <map-view ng-if="$ctrl.state.step === 'cut'" ng-hide="$ctrl.state.print" class="fullscreen"
      markers="$ctrl.markers" on-draw="$ctrl.addCluster($polygon)"></map-view>

  <print-view class="page" ng-if="$ctrl.state.print" clusters="$ctrl.clusters"></print-view>

  <notification-overlay class="notification-list" on-ready="$ctrl.attachNotifications($controller)"></notification-overlay>
`
