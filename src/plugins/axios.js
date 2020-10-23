"use strict";

import Vue from 'vue';
import axios from "axios";

const API_URL = 'http://192.168.1.105:3000'
// const API_URL = 'https://damp-beyond-02296.herokuapp.com'

// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

const config = {
  baseURL: API_URL,
  timeout: 60 * 1000,
  withCredentials: true, // Check cross-site Access-Control
  headers: {
    'Content-Type': 'application/json'
  }
}

const plainAxiosInstance = axios.create(config);
const securedAxiosInstance = axios.create(config);

securedAxiosInstance.interceptors.request.use(config => {
  const method = config.method.toUpperCase()
  if (method !== 'OPTIONS' && method !== 'GET') {
    config.headers = {
      ...config.headers,
      'X-CSRF-TOKEN': localStorage.csrf,
      'Authorization': localStorage.auth
    }
    console.log('Headers: ', config.headers)
  }
  return config
})
// _axios.interceptors.request.use(
//   function(config) {
//     // Do something before request is sent
//     return config;
//   },
//   function(error) {
//     // Do something with request error
//     return Promise.reject(error);
//   }
// );

// Add a response interceptor
securedAxiosInstance.interceptors.response.use(null, error => {
  if (error.response && error.response.config && error.response.status === 401) {
    // If 401 by expired access cookie, we do a refresh request
    return plainAxiosInstance.post('/refresh', {},
      { headers: {
          'X-CSRF-TOKEN': localStorage.csrf,
          'Authorization': localStorage.auth } })
      .then(response => {
        localStorage.csrf = response.data.csrf
        localStorage.signedIn = true
        // After another successfull refresh - repeat original request
        const retryConfig = error.response.config
        retryConfig.headers['X-CSRF-TOKEN'] = localStorage.csrf
        retryConfig.headers['Authorization'] = localStorage.auth
        return plainAxiosInstance.request(retryConfig)
      }).catch(error => {
        delete localStorage.csrf
        delete localStorage.signedIn
        // redirect to signin if refresh fails
        location.replace('/')
        return Promise.reject(error)
      })
  } else {
    return Promise.reject(error)
  }
})
// _axios.interceptors.response.use(
//   function(response) {
//     // Do something with response data
//     return response;
//   },
//   function(error) {
//     // Do something with response error
//     return Promise.reject(error);
//   }
// );

Plugin.install = function(Vue) {
  Vue.plain = plainAxiosInstance
  Vue.secured = securedAxiosInstance
  window.axios = securedAxiosInstance
  Object.defineProperties(Vue.prototype, {
    plain: {
      get() {
        return plainAxiosInstance;
      }
    },
    secured: {
      get() {
        return securedAxiosInstance;
      }
    }
  })
}

Vue.use(Plugin)

export default Plugin;


// export { securedAxiosInstance, plainAxiosInstance }
