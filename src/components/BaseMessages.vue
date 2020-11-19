<template>
  <div>
    <!-- <b-alert show v-bind:variant="componentVariant">
      {{ componentText }}
    </b-alert> -->
    <div v-if="!header">
      <div v-if="confirmation">
        <b-alert show=5 dismissible variant="success">
          {{ confirmation }}
        </b-alert>
      </div>
      <div v-if="loadstateParent && !edit">
        <b-alert show dismissible variant="warning">
          {{ loadstateParent }}
        </b-alert>
      </div>
      <div v-if="errors.length > 0 && (page || edit || draw)">
        <b-alert show dismissible variant="danger">
          <div v-for="message in errors" v-bind:key="message">
            {{ message }}
          </div>
        </b-alert>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseMessages',
  props: {
    confirmation: String,
    errors: Array
  },
  computed: {
    componentText () {
      let text = `Component: ${this.$parent.$options.name}`
      if (text.includes('Page') &&
        this.$axios.defaults.baseURL.includes('heroku')) {
        text += ' on Heroku'
      }
      return text
    },
    componentVariant () {
      return this.componentText.includes('Heroku') ? 'primary' : 'warning'
    },
    header () {
      return this.$parent.$options.name.includes('Header') ||
        this.$options.name.includes('Header')
    },
    edit () {
      return this.$parent.$options.name.includes('Edit')
    },
    page () {
      return this.$parent.$options.name.includes('Page')
    },
    draw () {
      return this.$parent.$options.name.includes('Draw')
    },
    loadstateParent () {
      return this.$parent.loadstate
    }
  }
}
</script>
