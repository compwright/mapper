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

  function createErrorNotification({ message }) {
    return {
      type: 'danger',
      title: 'Error',
      content: message
    }
  }

  this.push = (notification) => {
    if (notification instanceof Error) {
      notification = createErrorNotification(notification)
    }
    this.notifications = immutablePush(this.notifications, notification)
  }

  this.close = (notification) => {
    this.notifications = immutableRemove(this.notifications, this.notifications.indexOf(notification))
  }
}

controller.$inject = []

export const template = `
  <section class="notification-list">
    <notification ng-repeat="n in $ctrl.notifications | orderBy:'$index':true" title="n.title"
        type="n.type" duration="n.duration" allow-close="n.allowClose" on-close="$ctrl.close(n)" actions="n.actions">
      <div ng-if="n.content" ng-bind="n.content"></div>
      <geocode-progress ng-if="n.component === 'geocode-progress'" progress="n.progress"></geocode-progress>
    </notification> 
  </section>
`
