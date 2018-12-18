// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import Welcome from '@/components/Welcome'
import Home from '@/components/Home'
import Login from '@/components/Login'
import Signup from '@/components/Signup'
import SecretQuote from '@/components/SecretQuote'
import StudyList from '@/components/StudyList'
// import StudyList from "@/components/StudyList";
import dwv from '@/components/dwv'
// import 'vue-material/dist/vue-material.min.css'
// import 'vue-material/dist/theme/default.css'

import VueResource from 'vue-resource'
Vue.use(VueResource)

import VueRouter from 'vue-router'
Vue.use(VueRouter)

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
      path: '/home',
      name: 'home',
      component: Home,
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
      path: '/secretquote',
      name: 'secretquote',
      component: SecretQuote,
      beforeEnter: requireAuth
    },
    {
      path: '/Viewer',
      name: 'Viewer',
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
