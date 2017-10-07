export const bindings = {
  progress: '<'
}

export const require = {
  $parent: '^notification',
  $app: '^^app'
}

export function controller($timeout) {
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
        this.$app.$applyDebounced()
      },
      error: (error) => {
        subscription.unsubscribe()
        this.$parent.close()
        this.$app.$applyDebounced()
      },
      complete: () => {
        this.finished = true
        this.$app.$applyDebounced()
      }
    })
  }

  this.retry = () => {
    this.$app.geocode()
    this.$parent.close()
  }
}

controller.$inject = ['$timeout']

export const template = `
  <progress-bar ng-if="!$ctrl.error" style="width: 100%" value="$ctrl.value"></progress-bar>
  <progress-bar ng-if="$ctrl.error" style="width: 100%" value="{danger: 100}" message="{danger: $ctrl.error}"></progress-bar>
`
