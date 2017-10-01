import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/fromPromise'
import 'rxjs/add/operator/mergeAll'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/concatMap'
import 'rxjs/add/operator/delay'
import 'rxjs/add/operator/bufferTime'
import debounce from 'lodash.debounce'
import { addressFilter } from '../filters/address.filter'
import watchProgress from '../utils/promises-watcher'
import observeProgress from '../utils/progress-observer'
import immutableSplice from '../utils/immutable/array/splice'
import immutableClone from '../utils/immutable/array/clone'
import immutableSet from '../utils/immutable/object/set'
import ClusterManager from '../utils/cluster/manager'

function AppComponentController(geocoder, $rootScope, $timeout) {
  const $ctrl = this
  const $applyDebounced = debounce($rootScope.$apply.bind($rootScope), 100)

  this.markers = []
  this.clusters = []

  const clusterManager = new ClusterManager(this.markers)
  clusterManager.subscribe(clusters => (this.clusters = clusters))

  this.state = {
    step: 'cut', // 'input', 'cut'
    print: false,
    geocoding: false
  }

  const setMarkers = (markers = []) => {
    this.markers = markers
    clusterManager.markers = this.markers
  }

  this.setMarker = marker => {
    setMarkers(immutableSplice(this.markers, marker.$index, 1, marker))
  }

  this.updateMarker = ($event, $index, $change) => {
    const marker = immutableSet(this.markers[$index], { ...$change, $index })
    this.setMarker(marker)
    this.geocode()
  }

  this.addCluster = polygon => {
    const clusterIndex = clusterManager.add(polygon)
    $applyDebounced()

    // Refresh the cluster markers if the polygon is edited or moved
    polygon.onCoordinatesChanged(function() {
      clusterManager.refresh(clusterIndex)
      $applyDebounced()
    })
  }

  this.geocode = debounce(() => {
    // Find the markers that need to be geocoded
    const geocode = this.markers.filter(
      ({ $index, address, city, state, zip, lat, lng, $geocoded }) =>
        $index !== null &&
        $index !== undefined &&
        address &&
        city &&
        state &&
        zip &&
        !$geocoded &&
        (!lat || !lng)
    )

    this.state = immutableSet(this.state, 'geocoding', false)

    if (geocode.length === 0) return

    this.state = immutableSet(this.state, 'geocoding', {
      progress: 0,
      completed: 0,
      errors: 0,
      total: geocode.length
    })

    const operations = Observable.of(geocode)
      .mergeAll()
      .concatMap(value => Observable.of(value).delay(350)) // rate limit at 3 per second
      .map(marker => {
        const address = addressFilter(marker)
        const promise = geocoder({ address })
          .then(coordinates => immutableSet(marker, coordinates))
          .catch(error => {
            if (error === google.maps.GeocoderStatus.ZERO_RESULTS) {
              marker = immutableSet(marker, '$geocodeError', error)
              $applyDebounced()
              return Promise.resolve(marker)
            } else {
              this.state = immutableSet(this.state, 'geocoding', { error })
              $applyDebounced()
              return Promise.reject(error)
            }
          })
        return Observable.fromPromise(promise)
      })
      .mergeAll()

    operations.subscribe(marker => this.setMarker(marker), error => {})

    observeProgress(operations).subscribe({
      next: ({ completed, errors }) => {
        this.state = immutableSet(
          this.state,
          'geocoding',
          immutableSet(this.state.geocoding, {
            completed,
            errors,
            progress: 100 * (completed + errors) / geocode.length,
            successProgress: 100 * completed / geocode.length,
            errorProgress: 100 * errors / geocode.length
          })
        )
        if (
          completed + errors === geocode.length &&
          !this.state.geocoding.error
        ) {
          $timeout(() => {
            this.state = immutableSet(this.state, 'geocoding', false)
          }, 3000)
        }
        $applyDebounced()
      },
      completed: () => {
        if (!this.state.geocoding.error) {
          this.state = immutableSet(this.state, 'geocoding', false)
        }
      }
    })

    return operations
  }, 250)
}

AppComponentController.$inject = ['geocoder', '$rootScope', '$timeout']

export default {
  controller: AppComponentController,
  template: `
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
          <div class="pull-right" ng-show="$ctrl.state.geocoding">
            <p class="navbar-text">
              Geocoding
            </p>
            <div class="navbar-text progress" style="width: 300px">
              <div class="progress-bar progress-bar-success" ng-hide="$ctrl.state.geocoding.error"
                  ng-style="{width:$ctrl.state.geocoding.successProgress + '%'}">
                {{ $ctrl.state.geocoding.successProgress | number:0 }}%
              </div>
              <div class="progress-bar progress-bar-danger" ng-hide="$ctrl.state.geocoding.error"
                  ng-style="{width:$ctrl.state.geocoding.errorProgress + '%'}">
                {{ $ctrl.state.geocoding.errorProgress | number:0 }}%
              </div>
              <div class="progress-bar progress-bar-danger" style="width: 100%" ng-if="$ctrl.state.geocoding.error">
                {{ $ctrl.state.geocoding.error }}
              </div>
            </div>
            <div class="navbar-text">
              <button ng-click="$ctrl.geocode()" class="fa fa-repeat" title="Retry"></button>
            </div>
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

    <print-view class="page" ng-if="$ctrl.state.print" clusters="$ctrl.clusters"></print-view>`
}