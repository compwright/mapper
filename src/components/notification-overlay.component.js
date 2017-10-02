import immutablePush from '../utils/immutable/array/push'
import immutableRemove from '../utils/immutable/array/remove'

export const bindings = {
  onReady: '&'
}

export function controller() {
  this.notifications = []

  this.$onInit = () => {
    this.onReady({ $controller: this })
  }

  this.push = (notification) => {
    this.notifications = immutablePush(this.notifications, notification)
  }

  this.close = (index) => {
    this.notifications = immutableRemove(this.notifications, index)
  }
}

controller.$inject = []

export const template = `
  <section class="notification-list">
    <notification ng-repeat="n in $ctrl.notifications | orderBy:'$index':true" title="n.title"
        duration="n.duration" allow-close="n.allowClose" on-close="$ctrl.close($index)">
      <div ng-if="n.content" ng-bind="n.content"></div>
      <geocode-progress ng-if="n.component === 'geocode-progress'" progress="n.progress"></geocode-progress>
    </notification> 
  </section>
`
