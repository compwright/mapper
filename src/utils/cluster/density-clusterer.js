const { OPTICS } = require('density-clustering')

class MarkerCluster {
  constructor(id, markers = []) {
    this.id = id
    this.markers = markers
  }
}

module.exports = markers => {
  const optics = new OPTICS()
  const coordinates = markers.map(m => [m.lat, m.lng])
  const result = optics.run(coordinates, 0.003, 2)
  return result.map(
    (cluster, index) => ({
      id: index, 
      markers: cluster.map(i => markers[i])
    })
  )
}
