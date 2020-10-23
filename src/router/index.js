import Vue from 'vue'
import Router from 'vue-router'
import SigninPage from '@/views/SigninPage.vue'
import SignupPage from '@/views/SignupPage.vue'
import ContestsPage from '@/views/ContestsPage.vue'
import ContestPage from '@/views/ContestPage.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/contests',
      name: 'Contests',
      component: ContestsPage
    },
    {
      path: '/contest',
      name: 'Contest',
      component: ContestPage
    },
    {
      path: '/contest/:tab',
      name: 'ContestTab',
      component: ContestPage,
      props: true
    },
    {
      path: '/',
      name: 'Root',
      component: SigninPage
    },
    {
      path: '/signin',
      name: 'Signin',
      component: SigninPage
    },
    {
      path: '/signup',
      name: 'Signup',
      component: SignupPage
    }
  ]
})
