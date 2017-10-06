import 'core-js/fn/object/assign'
import 'core-js/fn/object/keys'
import 'core-js/fn/object/entries'

// Fire a callback whenever a Google Map drawing is edited
// (based on http://stackoverflow.com/a/33767960/168815)
if (typeof google === 'object') {
  google.maps.Polygon.prototype.onCoordinatesChanged = function(handler) {
    const polygon = this
    let isBeingDragged = false

    // set_at gets called repeatedly while the polygon is dragged,
    // so we need to set a flag to ignore the event until the end
    this.addListener('dragstart', function() {
      isBeingDragged = true
    })
    this.addListener('dragend', function() {
      handler.apply(polygon, arguments)
      isBeingDragged = false
    })

    // call handler() whenever any of the paths in the polygon changes
    this.getPaths().forEach(path => {
      path.addListener('insert_at', function() {
        handler.apply(polygon, arguments)
      })
      path.addListener('set_at', function() {
        if (!isBeingDragged) {
          handler.apply(polygon, arguments)
        }
      })
      path.addListener('remove_at', function() {
        handler.apply(polygon, arguments)
      })
    })
  }
}
