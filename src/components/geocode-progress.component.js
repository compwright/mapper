import debounce from 'lodash.debounce'

export const bindings = {
  progress: '<'
}

export const require = {
  $parent: '^notification',
  $app: '^^app'
}

export function controller($rootScope, $timeout) {
  const $applyDebounced = debounce($rootScope.$apply.bind($rootScope), 100)

  this.$onInit = () => {
    const subscription = this.progress.subscribe({
      next: ({ completed, errors, total }) => {
        this.value = {
          success: 100 * completed / total,
          warning: 100 * errors / total
        }
        if (completed + errors === total) {
          this.finished = true
          $timeout(() => this.$parent.close(), 2000)
        }
        $applyDebounced()
      },
      error: (error) => {
        subscription.unsubscribe()
        this.$parent.close()
        $applyDebounced()
      },
      complete: () => {
        this.finished = true
      }
    })
  }

  this.retry = () => {
    this.$app.geocode()
    this.$parent.close()
  }
}

controller.$inject = ['$rootScope', '$timeout']

export const template = `
  <progress-bar ng-if="!$ctrl.error" style="width: 100%" value="$ctrl.value"></progress-bar>
  <progress-bar ng-if="$ctrl.error" style="width: 100%" value="{danger: 100}" message="{danger: $ctrl.error}"></progress-bar>
  <div>
    <button ng-if="$ctrl.error" type="button" class="btn btn-default" ng-click="$ctrl.retry()" title="Retry">
      Retry
    </button>
    <button ng-if="$ctrl.finished" type="button" class="btn btn-default" ng-click="$ctrl.$parent.close()" title="Close">
      Close
    </button>
  </div>
`
