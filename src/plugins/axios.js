"use strict";

import Vue from 'vue';
import axios from 'axios';

const API_URL = process.env.VUE_APP_ITURNIER_BACKEND_API_URL

const config = {
  baseURL: API_URL,
  timeout: 60 * 1000,
  withCredentials: true, // Check cross-site Access-Control
  headers: {
    'Content-Type': 'application/json'
  }
}

const _axios = axios.create(config);

// Add a response interceptor
_axios.interceptors.response.use(null, error => {
  if (error.response && error.response.config && error.response.status === 401 && localStorage.auth && !error.request.responseURL.includes('refresh')) {
    // If 401 by expired access cookie, we do a refresh request
    console.warn('Token timed out, start refresh of token')
    return _axios.post('/refresh', {})
      .then(response => {
        console.log('Token successfully refreshed, retry original request')
        localStorage.auth = response.data.auth
        localStorage.signedIn = true
        // After another successfull refresh - repeat original request
        const retryConfig = error.response.config
        retryConfig.headers['Authorization'] = localStorage.auth
        _axios.defaults.headers.common['Authorization'] = localStorage.auth
        return _axios.request(retryConfig)
      })
      .catch(error => {
        console.error('Token refresh failed, logged out')
        delete localStorage.auth
        delete localStorage.signedIn
        delete localStorage.signinType
        delete localStorage.signinData
        // redirect to signin if refresh fails
        location.replace('/')
        return Promise.reject(error)
      })
  } else {
    return Promise.reject(error)
  }
})

Plugin.install = function(Vue) {
  Vue.$axios = _axios
  window.axios = _axios
  Object.defineProperties(Vue.prototype, {
    axios: {
      get() {
        return _axios;
      }
    },
    $axios: {
      get() {
        return _axios;
      }
    }
  })
}

Vue.use(Plugin)

export default Plugin;
