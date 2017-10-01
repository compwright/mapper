'use strict'

import './app.scss'

import './utils/polyfills'

import angular from 'angular'
import 'angular-debounce'
import 'angular-strap/dist/modules/button'
import 'ngmap'
import 'ng-handsontable/dist/ngHandsontable'

import latLngFilter from './filters/latlng.filter'
import hasLatLngFilter from './filters/has-lat-lng.filter'
import geocoderService from './services/geocoder.service'
import components from './components'

const app = angular.module('mapper', [
  'ngMap',
  'ngHandsontable',
  'mgcrea.ngStrap.button'
])

app.service('geocoder', geocoderService)
app.filter('latlng', latLngFilter)
app.filter('hasLatLng', hasLatLngFilter)

Object.entries(components)
  .forEach(component => app.component(...component))
