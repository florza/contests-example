<template>
  <div>
    <base-messages
      v-bind:confirmation="confirmation"
      v-bind:errors="errors"
    ></base-messages>

    <b-nav align="right">
      <b-nav-text v-if="signedIn()">
        {{ signinName }}
      </b-nav-text>
      <b-nav-item to="/signin" v-if="!signedIn()">
        Sign in
      </b-nav-item>
      <b-nav-item to="/signup" v-if="!signedIn()">
        Sign Up
      </b-nav-item>
      <b-nav-item v-on:click="signOut()" v-if="signedIn()">
        Log out
      </b-nav-item>
    </b-nav>
    <div>
      <b-link href="/" >
        <h1>{{ titleText }}</h1>
      </b-link>
    </div>
  </div>
</template>

<script>
import { apiMixins } from '@/mixins/apiMixins.js'

export default {
  name: 'TheHeader',
  mixins: [apiMixins],
  data () {
    return {}
  },
  computed: {
    signinName () {
      if (this.signedIn) {
        const data = JSON.parse(localStorage.signinData)
        if (localStorage.signinType === 'user') {
          return data.username
        } else if (localStorage.signinType === 'token') {
          return data.tokentype + ' key' +
            (data.tokenrole === 'read' ? ' (read only)' : '')
        }
      }
      return 'not logged in'
    },
    loadstate () {
      if (this.$store.getters.loadstate) {
        return this.$store.getters.loadstate
      }
      if (this.$store.getters.loadstateContests.includes('loading') ||
          this.$store.getters.loadstateParticipants.includes('loading') ||
          this.$store.getters.loadstateMatches.includes('loading')) {
        return 'loading contest data...'
      }
      return ''
    },
    titleText () {
      let text = 'ContestsOrganizer'
      if (this.$axios.defaults.baseURL.includes('heroku')) {
        text += ' on Heroku'
      }
      return text
    }
  },
  methods: {
    signedIn () {
      return localStorage.signedIn
    },
    signOut () {
      this.$axios.delete('/signin')
        .then(() => {
          delete localStorage.auth
          delete localStorage.signedIn
          delete localStorage.signinType
          delete localStorage.signinData
          delete this.$axios.defaults.headers.common['Authorization']
          this.$router.replace('/')
        })
        .catch(error => this.setError(error, 'Cannot sign out'))
    }
  }
}
</script>
