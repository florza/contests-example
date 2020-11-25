<template>
  <span>
    <b-button
      v-on:click="decrement(param)"
        variant="secondary"
        class="btn btn-sm"
        v-bind:disabled="decrementDisabled"
    >
      <b-icon icon="dash-circle"></b-icon>
    </b-button>
    {{ value }}
    <b-button v-on:click="increment(param)"
      variant="secondary"
      class="btn btn-sm"
      v-bind:disabled="incrementDisabled"
    >
      <b-icon icon="plus-circle"></b-icon>
    </b-button>
  </span>
</template>

<script>
export default {
  name: 'BaseIncrementor',
  props: {
    value: String,
    param: Number,
    decrement: Function,
    increment: Function,
    decrementDisabled: Boolean,
    incrementDisabled: Boolean,
    errors: Array
  // },
  // computed: {
  //   componentText () {
  //     let text = `Component: ${this.$parent.$options.name}`
  //     if (text.includes('Page') &&
  //       this.$axios.defaults.baseURL.includes('heroku')) {
  //       text += ' on Heroku'
  //     }
  //     return text
  //   },
  //   componentVariant () {
  //     return this.componentText.includes('Heroku') ? 'primary' : 'warning'
  //   },
  //   header () {
  //     return this.$parent.$options.name.includes('Header') ||
  //       this.$options.name.includes('Header')
  //   },
  //   edit () {
  //     return this.$parent.$options.name.includes('Edit')
  //   },
  //   page () {
  //     return this.$parent.$options.name.includes('Page')
  //   },
  //   loadstateParent () {
  //     return this.$parent.loadstate
  //   }
  }
}
</script>
