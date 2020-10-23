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
        <h3>Contests</h3>
        <contests></contests>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import TheHeader from '@/components/TheHeader.vue'
import Contests from '@/components/contests/Contests.vue'

export default {
  name: 'ContestsPage',
  data () {
    return {
      confirmation: '',
      errors: []
    }
  },
  created () {
    console.log('Creating component ' + this.$options.name)
    this.$store.dispatch('loadContests')
  },
  computed: {
    allContests () {
      return this.$store.getters.allContest
    }
  },
  components: {
    TheHeader,
    Contests
  }
}
</script>
