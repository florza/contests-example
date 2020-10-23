<template>
  <div>
    <base-messages
      v-bind:confirmation="confirmation"
      v-bind:errors="errors"
    ></base-messages>
    <h3 class="">Sign In</h3>
    <div v-if="errors.length > 0">
      <b-alert  variant="danger" show dismissible>
          <div v-for="message in errors" v-bind:key="message">
            {{ message }}
          </div>
      </b-alert>
    </div>

    <b-form @submit.prevent="signinUser">

      <b-form-group for="username" label="Username">
        <b-form-input id="username" type="text" autofocus v-model="username" placeholder="myusername"></b-form-input>
      </b-form-group>
      <b-form-group for="password" label="Password">
        <b-form-input id="password" type="password" v-model="password"  placeholder="Password"></b-form-input>
      </b-form-group>

      <b-button type="submit" variant="primary">Sign in as User</b-button>
    </b-form>

    <hr />

    <b-form @submit.prevent="signinToken">

      <b-form-group for="contestkey" label="Contestkey">
        <b-form-input id="contestkey" type="text" v-model="contestkey"
      ></b-form-input>
      </b-form-group>

      <b-button type="submit" variant="primary">
        Sign in with Contest Key
      </b-button>
    </b-form>

  </div>
</template>

<script>
import { apiMixins } from '@/mixins/apiMixins.js'

export default {
  name: 'Signin',
  mixins: [apiMixins],
  data () {
    return {
      username: '',
      password: '',
      contestkey: ''
    }
  },
  methods: {
    signinUser () {
      this.callAxiosSignInUp('/signin',
        { username: this.username, password: this.password })
    },
    signinToken () {
      this.callAxiosSignInUp('/signin',
        { contestkey: this.contestkey })
    }
  }
}
</script>
