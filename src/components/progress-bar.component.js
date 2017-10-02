export const bindings = {
  value: '<',
  message: '<'
}

export function controller() {
  this.isDiscrete = () => {
    return typeof this.value === 'number'
  }

  this.isStacked = () => {
    return typeof this.value === 'object'
  }
}

export const template = `
  <div class="progress" ng-if="$ctrl.isDiscrete()">
    <div class="progress-bar" ng-style="{width:$ctrl.value + '%'}" ng-cloak>
      <span ng-if="!$ctrl.message && $ctrl.value > 0">{{ $ctrl.value | number:0 }}%</span>
      <span ng-if="$ctrl.message" ng-bind="$ctrl.message"></span>
    </div>
  </div>
  <div class="progress" ng-if="$ctrl.isStacked()">
    <div ng-repeat="(type, value) in $ctrl.value" class="progress-bar" ng-class="'progress-bar-' + type"
        ng-style="{width:value + '%'}" ng-cloak>
      <span ng-if="!$ctrl.message[type] && value > 0">{{ value | number:0 }}%</span>
      <span ng-if="$ctrl.message[type]" ng-bind="$ctrl.message[type]"></span>
    </div>
  </div>
`
