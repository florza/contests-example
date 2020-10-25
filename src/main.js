// // Original version from vue cli
// import '@babel/polyfill'
// import 'mutationobserver-shim'
// import Vue from 'vue'
// import './plugins/axios'
// import './plugins/fontawesome'
// import './plugins/bootstrap-vue'
// import App from './App.vue'
// import router from './router'
// import store from './store'

// Vue.config.productionTip = false

// new Vue({
//   router,
//   store,
//   render: h => h(App)
// }).$mount('#app')

// Merged version from iturnier2frontend and vue cli
// import '@babel/polyfill'
import 'mutationobserver-shim'
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

import './plugins/axios'
import './plugins/bootstrap-vue'
import './plugins/fontawesome'

import App from './App.vue'
import router from './router'
import store from './store'
// import './custom.scss' Verursacht Build-Fehler!

import datePicker from 'vue-bootstrap-datetimepicker'
import 'pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.css'

import BaseMessages from '@/components/BaseMessages.vue'

Vue.config.productionTip = false

Vue.component('base-messages', BaseMessages)
Vue.component('date-picker', datePicker)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
  render: h => h(App)
})
