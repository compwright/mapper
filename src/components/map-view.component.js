import angular from 'angular'

function MapViewComponentController(NgMap) {
  // Map initialized callback
  NgMap.getMap().then(map => {
    this.onReady({ $map: map })
  })

  this.onOverlayComplete = (e) => this.onDraw({ $polygon: e.overlay })
}

MapViewComponentController.$inject = ['NgMap']

export default {
  bindings: {
    markers: '<',
    onReady: '&',
    onDraw: '&'
  },
  controller: MapViewComponentController,
  template: `
    <ng-map class="map" center="[41,-87]" zoom="3" zoom-to-include-markers="auto" map-type-control="false" street-view-control="false">
      <custom-marker ng-repeat="m in $ctrl.markers" ng-if="m.lat && m.lng"
          position="{{ m | latlng }}" id="custom-marker-{{m.$index}}"
          on-click="return false;showInfoWindow('infoWindow', 'custom-marker-'+m.$index, m)">
        <div class="marker" ng-class="m.$class">{{m.$index + 1}}</div>
      </custom-marker>
      <drawing-manager on-overlaycomplete="$ctrl.onOverlayComplete()" drawing-control-options="{ position: 'TOP_CENTER', drawingModes: [ 'polygon' ] }"
        drawingControl="true" drawingMode="null" polygonOptions="{ editable: true, draggable: true }"></drawing-manager>
    </ng-map>`
}
