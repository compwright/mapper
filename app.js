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
	'mgcrea.ngStrap.button'
])

.controller('plotter', ['$scope', '$filter', 'NgMap', function($scope, $filter, NgMap) {
	$scope.markers = [];
	$scope.clusters = [];
	$scope.map = {};

	// map must initialize while visible
	$scope.plotter = {
		mode: 'cut',
		print: false
	};

	NgMap.getMap().then(function(map) {

		// when the map stops changing...
		map.addListener('idle', function() {
			// set the visibility flag on each marker
			var i = 0;
			angular.forEach(map.customMarkers, function(marker) {
				if (!$scope.markers[i].position) {
					$scope.markers[i].$index = i;
					$scope.markers[i].position = marker.getPosition();
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

	$scope.onMapOverlayCompleted = function(e) {
		function getMarkersInBounds(markers, bounds) {
			return markers.filter(function(marker) {
				return marker.position && bounds.contains(marker.position);
			});
		}

		var polygon = e.overlay;
		var cluster = {
			polygon: polygon,
			markers: getMarkersInBounds($scope.markers, polygon.getBounds())
		};

		polygon.onCoordinatesChanged(function() {
			cluster.markers = getMarkersInBounds($scope.markers, polygon.getBounds());
			$scope.$apply();
		});

		$scope.clusters.push(cluster);
	};

    $scope.indexRenderer = function(hotInstance, td, row, col, prop, value, cellProperties) {
		td.innerHTML = row + 1;
		angular.element(td).css({ textAlign: 'center' });
	};
}])

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
