function latLngFilter({ lat, lng }) {
  if (lat && lng) {
    return lat + ',' + lng
  } else {
    return ''
  }
}

export default () => latLngFilter
