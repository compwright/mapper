import debounce from 'lodash.debounce'
import observeProgress from '../utils/progress-observer'
import immutableSet from '../utils/immutable/object/set'
import ClusterManager from '../utils/cluster/manager'
import MarkerCollection from '../utils/marker/collection'
import MarkerGeocoder from '../utils/marker/geocoder'
import { hasSomeAddress, hasCoordinates } from '../utils/validation'
import densityClusterer from '../utils/cluster/density-clusterer'

export function controller(geocoder, $rootScope) {
  this.markers = []
  this.clusters = []
  this.state = {
    step: 'cut', // 'input', 'cut'
    print: false
  }

  this.$applyDebounced = debounce($rootScope.$apply.bind($rootScope), 100)
  
  const markerGeocoder = new MarkerGeocoder(geocoder)
  const markerCollection = new MarkerCollection()
  markerCollection.subscribe(markers => {
    this.markers = markers
    this.$applyDebounced()
  })

  const clusterManager = new ClusterManager(markerCollection)
  clusterManager.subscribe(clusters => {
    this.clusters = clusters
    this.$applyDebounced()
  })

  this.attachNotifications = $notificationOverlayController => {
    this.addNotification = notification => {
      $notificationOverlayController.push(notification)
      this.$applyDebounced()
    }
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

    markerCollection.set(marker)

    if (needsGeocode) {
      this.geocode()
    }
  }

  this.addCluster = polygon => {
    const clusterIndex = clusterManager.add(polygon)

    // Refresh the cluster markers if the polygon is edited or moved
    polygon.onCoordinatesChanged(function() {
      clusterManager.refresh(clusterIndex)
    })
  }

  this.autoCluster = () => {
    this.clusters = densityClusterer(this.markers.filter(hasCoordinates))
    console.log(this.clusters)
  }

  this.geocode = debounce(() => {
    const { length, operations } = markerGeocoder.geocode(markerCollection)

    if (operations) {
      operations.subscribe({
        next: () => this.$applyDebounced(),
        error: error => {
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
        complete: () => this.$applyDebounced()
      })

      this.addNotification({
        component: 'geocode-progress',
        title: 'Geocoding addresses, please wait...',
        allowClose: false,
        progress: observeProgress(operations, length)
      })
    }
  }, 250)
}

controller.$inject = ['geocoder', '$rootScope']

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
          <button type="button" class="btn btn-default" ng-click="$ctrl.autoCluster()">
            <i class="fa fa-dot-circle-o"></i> Auto-Cluster
          </button>
          <button type="button" class="btn btn-default" ng-model="$ctrl.state.print"
              bs-checkbox ng-disabled="$ctrl.clusters.length === 0">
            <i class="fa fa-print"></i> Print Preview
          </button>
        </div>
      </div>
    </div>
  </nav>

  <spreadsheet-view ng-show="$ctrl.state.step === 'input' && !$ctrl.state.print"
      rows="$ctrl.markers"
      on-change="$ctrl.updateMarker($event, $index, $change)"></spreadsheet-view>

  <map-view ng-if="$ctrl.state.step === 'cut'" ng-hide="$ctrl.state.print" class="fullscreen"
      markers="$ctrl.markers"
      on-draw="$ctrl.addCluster($polygon)"></map-view>

  <print-view class="page" ng-if="$ctrl.state.print"
      clusters="$ctrl.clusters"></print-view>

  <notification-overlay class="notification-list"
      on-ready="$ctrl.attachNotifications($controller)"></notification-overlay>
`
