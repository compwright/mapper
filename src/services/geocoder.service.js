import geocoder from '../utils/geocoder'
import { default as memoize, LocalStorageStore } from '../utils/memoize-async'

function geocoderServiceFactory($window) {
  //return geocoder
  return memoize(new LocalStorageStore($window.localStorage))(geocoder)
}

geocoderServiceFactory.$inject = ['$window']

export default geocoderServiceFactory
