export const bindings = {
  clusters: '<'
}

export const template = `
  <article ng-repeat="cluster in $ctrl.clusters">
    <ng-map class="map" center="[41,-87]" zoom="3" zoom-to-include-markers="auto" map-type-control="false" street-view-control="false">
      <custom-marker ng-repeat="m in cluster.markers" ng-if="m.lat && m.lng" position="{{ m | latlng }}" id="custom-marker-{{m.$index}}">
        <div class="marker" ng-class="m.$class">{{m.$index + 1}}</div>
      </custom-marker>
    </ng-map>
    <table class="table table-condensed table-bordered table-striped">
      <colgroup>
        <col style="width:30px">
        <col style="width:150px">
        <col style="width:150px">
        <col style="width:100px">
        <col style="width:75px">
        <col style="width:75px">
        <col style="width:75px">
        <col style="width:75px">
        <col style="width:75px">
        <col style="width:75px">
      </colgroup>
      <thead>
        <tr>
          <th rowspan="2" class="text-center">#</th>
          <th rowspan="2" class="text-center">Household</th>
          <th rowspan="2" class="text-center">Address</th>
          <th rowspan="2" class="text-center">City</th>
          <th colspan="6" class="text-center">Response</th>
        </tr>
        <tr>
          <th class="text-center">Vacant</th>
          <th class="text-center">Away</th>
          <th class="text-center">Refused</th>
          <th class="text-center">Undecided</th>
          <th class="text-center">Supporter</th>
          <th class="text-center">Sign</th>
        </tr>
      </thead>
      <tbody>
        <tr ng-repeat="marker in cluster.markers">
          <td ng-bind="marker.$index + 1"></td>
          <td ng-bind="marker.name"></td>
          <td ng-bind="marker.address"></td>
          <td ng-bind="marker.city"></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </article>
`
