import immutableSet from '../immutable/object/set'

export default class MarkerCluster {
  constructor(id, polygon, markers = []) {
    this.id = id
    this.polygon = polygon
    this.markers = this.add(markers)
  }

  add(markers = []) {
    return markers
      .filter(
        ({ lat, lng }) =>
          lat &&
          lng &&
          google.maps.geometry.poly.containsLocation(
            new google.maps.LatLng({ lat, lng }),
            this.polygon
          )
      )
      .map(marker =>
        immutableSet(marker, {
          $cluster: this.id,
          $class: 'cluster-' + (1 + this.id % 12)
        })
      )
  }
}
