function hasLatLngFilter(markers) {
  if (!Array.isArray(markers)) return markers
  return markers.filter(({lat, lng}) => lat && lng)
}

export default () => hasLatLngFilter
