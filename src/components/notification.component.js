export const bindings = {
  title: '<',
  type: '<',
  duration: '<',
  allowClose: '<',
  actions: '<',
  onClose: '&'
}

export const transclude = true

export function controller($timeout) {
  this.$onChanges = () => {
    this.classes = [
      'alert-' + (this.type || 'info')
    ]

    if (this.allowClose !== false && !this.duration) {
      this.showCloseButton = true
      this.classes.push('alert-dismissable')
    }

    if (this.duration > 0) {
      if (this.timer) {
        $timeout.cancel(this.timer)
      }
      this.timer = $timeout(() => this.close(), this.duration)
    }
  }

  this.close = () => {
    this.onClose()
  }
  
  this.perform = (action) => {
    if (action.closeNotification) {
      this.close()
    }
    action.onClick()
  }
}

controller.$inject = ['$timeout']

export const template = `
  <article class="notification alert alert-info fade in" ng-class="$ctrl.classes">
    <button type="button" class="close" ng-show="$ctrl.showCloseButton" ng-click="$ctrl.close()">
      <i class="fa fa-times"></i>
    </button>
    <b ng-if="$ctrl.title" ng-bind="$ctrl.title"></b>
    <ng-transclude></ng-transclude>
    <a ng-repeat="action in $ctrl.actions" class="alert-link" href="" ng-click="$ctrl.perform(action)"
        title="{{ action.title }}" ng-bind="action.text"></a>
  </article>
`
