const geocoder = (address) => new Promise((resolve, reject) => {
  const geocoder = new google.maps.Geocoder()
  
  geocoder.geocode(address, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      resolve({
        lat: results[0].geometry.location.lat(),
        lng: results[0].geometry.location.lng()
      })
    } else {
      reject(new Error(status))
    }
  })
})

export default geocoder
