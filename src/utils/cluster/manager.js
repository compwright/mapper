import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import immutablePush from '../immutable/array/push'
import immutableRemove from '../immutable/array/remove'
import immutableSplice from '../immutable/array/splice'
import MarkerCluster from './cluster'

export default class ClusterManager {
  constructor(markers) {
    this.markers = markers
    this.clusters = []
    this.assignments = new Map()
    this.changes = Observable.create(observable => this.changeObserver = observable)
  }

  add(polygon) {
    const clusterIndex = this.clusters.length
    const cluster = this._createCluster(clusterIndex, polygon)
    this.clusters = immutablePush(this.clusters, cluster)
    this.changeObserver.next(this.clusters)
    return clusterIndex
  }

  refresh(clusterIndex) {
    const { markers, polygon } = this.clusters[clusterIndex]
    this._unassignMarkers(markers)
    const cluster = this._createCluster(clusterIndex, polygon)
    this.clusters = immutableSplice(this.clusters, clusterIndex, 1, cluster)
    this.changeObserver.next(this.clusters)    
  }

  delete(clusterIndex) {
    const { markers } = this.clusters[clusterIndex]
    this._unassignMarkers(markers)
    this.clusters = immutableRemove(this.clusters, clusterIndex)
    this.changeObserver.next(this.clusters)
  }

  subscribe(observer) {
    return this.changes.subscribe(observer)
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
