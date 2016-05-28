'use strict';

// fire a coordinates_changed event when a google map drawing is edited
// based on http://stackoverflow.com/a/33767960/168815
google.maps.Polygon.prototype.onCoordinatesChanged = function(handler){
  var polygon = this,
      isBeingDragged = false;

  //if  the polygon is being dragged, set_at gets called repeatedly, so either we can debounce that or igore while dragging, ignoring is more efficient
  polygon.addListener('dragstart',function(){
    isBeingDragged = true;
  });

  //if the polygon is dragged
  polygon.addListener('dragend',function(){
    handler.apply(polygon, arguments);
    isBeingDragged = false;
  });

  //or vertices are added to any of the possible paths, or deleted 
  var paths = polygon.getPaths();
  paths.forEach(function(path,i){
    path.addListener("insert_at",function(){
	    handler.apply(polygon, arguments);
    });
    path.addListener("set_at",function(){
      if(!isBeingDragged){
	      handler.apply(polygon, arguments);
      }
    });
    path.addListener("remove_at",function(){
	    handler.apply(polygon, arguments);
    });
  });
};

angular.module('mapper', [
	'ngMap',
	'ngHandsontable',
	'mgcrea.ngStrap.button',
	'rt.debounce'
])

.controller('plotter', ['$scope', '$filter', 'debounce', 'NgMap', function($scope, $filter, debounce, NgMap) {
	$scope.markers = [];
	$scope.clusters = [];
	$scope.map = {};
	$scope.geocoder = new google.maps.Geocoder();

	// map must initialize while visible
	$scope.plotter = {
		mode: 'cut',
		print: false
	};

	// HandsOnTable afterChange() callback used to
	// immediately geocode markers that don't have latitude and longitude
	$scope.onInput = function() {
		var needLatLng = $scope.markers.filter(function(marker) {
			if (marker.address && (!marker.lat || !marker.lng) && !marker.promise) {
				marker.$geocoded = 'pending';
				return true;
			}
		});

		if (!needLatLng.length) {
			return;
		}

		var $scopeApplyDebounced = debounce(1000, function() {
			$scope.$apply();
		});

		needLatLng.map(function(marker) {
			var address = {
				address: $filter('address')(marker)
			};
			$scope.geocoder.geocode(address, function(results, status) {
				marker.$geocoded = status;
				if (status === google.maps.GeocoderStatus.OK) {
					marker.lat = results[0].geometry.location.lat();
					marker.lng = results[0].geometry.location.lng();
					$scopeApplyDebounced();
				}
			});
		});
	};

	// Map initialized callback
	NgMap.getMap().then(function(map) {

		// when the map stops changing...
		map.addListener('idle', function() {
			// set an $index flag and a reference to the Google map marker object
			var i = 0;
			angular.forEach(map.customMarkers, function(marker) {
				if (!$scope.markers[i].$index) {
					$scope.markers[i].$index = i;
					$scope.markers[i].marker = marker;
				}
				i++;
			});

			/*
			// do the chunking here, to avoid infinite digest looping
			// https://groups.google.com/d/msg/angular/IEIQok-YkpU/InEXv61MrkMJ
	    	$scope.chunkedMarkers = $filter('chunk')(
	    		$scope.markers.filter(function(marker) {
	    			return !!marker.visible;
	    		})
	    	);
			*/

			$scope.$apply();
		});

		$scope.map = map;
		$scope.plotter.mode = 'input';
    });

	// Map polygon drawing overlaycomplete() callback
	// add a new cluster from the markers inside the polygon
	$scope.onMapOverlayCompleted = function(e) {
		function getMarkersInBounds(markers, bounds) {
			return markers.filter(function(marker) {
				return !marker.$cluster && marker.marker && bounds.contains(marker.marker.getPosition());
			});
		}

		var polygon = e.overlay;
		var cluster = {
			polygon: polygon,
			markers: getMarkersInBounds($scope.markers, polygon.getBounds())
		};

		// update the cluster if the polygon is edited or moved
		polygon.onCoordinatesChanged(function() {
			cluster.markers = getMarkersInBounds($scope.markers, polygon.getBounds());
			$scope.$apply();
		});

		// set a cluster index flag
		var i = $scope.clusters.length;
		cluster.markers.map(function(marker) {
			marker.$cluster = i;
			marker.$class = 'cluster-' + (1 + (i % 12));
		});

		$scope.clusters.push(cluster);
	};

	// HandsOnTable index column renderer
    $scope.indexRenderer = function(hotInstance, td, row, col, prop, value, cellProperties) {
		td.innerHTML = row + 1;
		angular.element(td).css({ textAlign: 'center' });
	};
}])

.filter('address', function() {
	return function(marker) {
		if (marker.address && marker.city && marker.state && marker.zip) {
			return marker.address + ', ' + marker.city + ', ' + marker.state + ' ' + marker.zip;
		} else {
			return '';
		}
	};
})

.filter('latlng', function() {
	return function(marker) {
		if (marker.lat && marker.lng) {
			return [ marker.lat, marker.lng ].join(',');
		} else {
			return '';
		}
	};
})

// don't use with ngRepeat
.filter('chunk', function() {
	return function(input, size) {
		input = input || [];
		size = size || 25;

		if (!angular.isArray(input)) {
			return input;
		}

		var chunked = [];
		for (var i = 0; i < input.length; i += size) {
			chunked.push(input.slice(i, i + size));
		}

		return chunked;
	};
});
