// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import Welcome from '@/components/Welcome'
import UserList from '@/components/UserList'
import Login from '@/components/Login'
import Signup from '@/components/Signup'
import StudyList from '@/components/StudyList'
// import StudyList from "@/components/StudyList";
import dwv from '@/components/dwv'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'

import VueResource from 'vue-resource'
Vue.use(VueResource)

import VueRouter from 'vue-router'
Vue.use(VueRouter)

import SuiVue from 'semantic-ui-vue'
Vue.use(SuiVue)

Vue.config.productionTip = true

import auth from './auth'

function requireAuth (to, from, next) {
  if (!auth.isAuthenticated()) {
    this.$router.replace('/login')
  } else {
    next()
  }
}

const router = new VueRouter({
  mode: 'history',
  // base: __dirname,
  routes: [
    {
      path: '/',
      component: Welcome
    },
    {
      path: '/welcome',
      name: 'welcome',
      component: Welcome
    },
    {
      path: '/userlist',
      name: 'userlist',
      component: UserList,
      beforeEnter: requireAuth
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup
    },
    {
      path: '/studylist',
      name: 'studylist',
      component: StudyList,
      beforeEnter: requireAuth
    },
    {
      path: '/viewer',
      name: 'viewer',
      component: dwv,
      beforeEnter: requireAuth
    }
  ]
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
