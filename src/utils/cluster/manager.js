import { Subject } from 'rxjs/Subject'
import immutablePush from '../immutable/array/push'
import immutableRemove from '../immutable/array/remove'
import immutableSplice from '../immutable/array/splice'
import MarkerCluster from './cluster'

export default class ClusterManager extends Subject {
  constructor(markerCollection) {
    super()
    this.markers = []
    this.clusters = []
    this.assignments = new Map()

    markerCollection.subscribe(markers => {
      this.markers = markers
      this.refreshAll()
    })
  }

  add(polygon) {
    const clusterIndex = this.clusters.length
    const cluster = this._createCluster(clusterIndex, polygon)
    this.clusters = immutablePush(this.clusters, cluster)
    this.next(this.clusters)
    return clusterIndex
  }

  refresh(clusterIndex) {
    const { markers, polygon } = this.clusters[clusterIndex]
    this._unassignMarkers(markers)
    const cluster = this._createCluster(clusterIndex, polygon)
    this.clusters = immutableSplice(this.clusters, clusterIndex, 1, cluster)
    this.next(this.clusters)
  }

  refreshAll() {
    this.clusters.forEach((cluster, index) => this.refresh(index))
  }

  delete(clusterIndex) {
    const { markers } = this.clusters[clusterIndex]
    this._unassignMarkers(markers)
    this.clusters = immutableRemove(this.clusters, clusterIndex)
    this.next(this.clusters)
  }

  _createCluster(clusterIndex, polygon) {
    const markers = this._getUnassignedMarkers()
    const cluster = new MarkerCluster(clusterIndex, polygon, markers)
    this._assignMarkers(clusterIndex, cluster.markers)
    return cluster
  }

  _getUnassignedMarkers() {
    return this.markers.filter(({ $index }) => !this.assignments.has($index))
  }

  _assignMarkers(clusterIndex, markers = []) {
    markers.forEach(({ $index }) => this.assignments.set($index, clusterIndex))
  }

  _unassignMarkers(markers = []) {
    markers.forEach(({ $index }) => this.assignments.delete($index))
  }
}
