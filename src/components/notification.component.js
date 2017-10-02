export const bindings = {
  title: '<',
  duration: '<',
  allowClose: '<',
  onClose: '&'
}

export const transclude = true

export function controller($timeout) {
  this.$onInit = () => {
    if (this.duration > 0) {
      $timeout(() => this.close(), this.duration)
    }
  }

  this.close = () => {
    this.onClose()
  }
}

controller.$inject = ['$timeout']

export const template = `
  <article class="notification alert alert-info fade in" ng-class="{'alert-dismissible': !$ctrl.duration && $ctrl.allowClose !== false}">
    <button type="button" class="close" ng-hide="$ctrl.duration > 0 || $ctrl.allowClose === false" ng-click="$ctrl.close()"><i class="fa fa-times"></i></button>
    <b ng-if="$ctrl.title" ng-bind="$ctrl.title"></b>
    <ng-transclude></ng-transclude>
  </article>
`
