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
        <Signin></Signin>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import TheHeader from '@/components/TheHeader.vue'
import Signin from '@/components/Signin.vue'

export default {
  name: 'SigninPage',
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
    Signin
  }
}
</script>
