<template>
  <b-container>
    <b-row>
      <b-col>
        <base-messages
          v-bind:confirmation="confirmation"
          v-bind:errors="errors"
        ></base-messages>
        <the-header></the-header>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <Signup></Signup>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import TheHeader from '@/components/TheHeader.vue'
import Signup from '@/components/Signup.vue'

export default {
  name: 'SignupPage',
  data () {
    return {
      confirmation: '',
      errors: []
    }
  },
  created () {
    console.log('Creating component ' + this.$options.name)
  },
  components: {
    TheHeader,
    Signup
  }
}
</script>
