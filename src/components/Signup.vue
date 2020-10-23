<template>
 <div>
    <base-messages
      v-bind:confirmation="confirmation"
      v-bind:errors="errors"
    ></base-messages>
    <h3 class="">Sign Up</h3>
    <div v-if="errors.length > 0">
      <b-alert  variant="danger" show dismissible>
          <div v-for="message in errors" v-bind:key="message">
            {{ message }}
          </div>
      </b-alert>
    </div>

    <b-form @submit.prevent="signup">

      <b-form-group for="username" label="Username">
        <b-form-input id="username" type="text" placeholder="myusername"
          v-model="username"
        ></b-form-input>
      </b-form-group>
      <b-form-group for="password" label="Password">
        <b-form-input id="password" type="password" placeholder="Password"
          v-model="password"
        ></b-form-input>
      </b-form-group>
      <b-form-group for="password_confirmation" label="Password Confirmation">
        <b-form-input id="password_confirmation" type="password"
          placeholder="Password"
          v-model="password_confirmation"
        ></b-form-input>
      </b-form-group>

      <b-button type="submit" variant="primary" to="/contests">
        Sign Up
      </b-button>
    </b-form>

  </div>
</template>

<script>
import { apiMixins } from '@/mixins/apiMixins.js'

export default {
  name: 'Signup',
  mixins: [apiMixins],
  data () {
    return {
      username: '',
      password: '',
      password_confirmation: ''
    }
  },
  methods: {
    signup () {
      this.callAxiosSignInUp('/signup',
        { username: this.username,
          password: this.password,
          password_confirmation: this.password_confirmation }
      )
    }
  }
}
</script>
