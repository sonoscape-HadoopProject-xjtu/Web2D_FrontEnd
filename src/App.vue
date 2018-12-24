<template>
<div id="app">
  <nav class="navbar navbar-default navbar-static-top">
    <div class="container">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <div class="navbar-brand"><router-link to="Welcome">Web2D阅片系统</router-link></div>
      </div>
      <div id="navbar" class="navbar-collapse collapse">
        <ul class="nav navbar-nav">
          <li v-if="!isAuthenticated()"><router-link to="login">Login</router-link></li>
          <li v-if="!isAuthenticated()"><router-link to="signup">Sign Up</router-link></li>
          <li v-if="isAuthenticated()"><router-link to="studylist">Study List</router-link></li>
          <li v-if="isAuthenticated() & isAdmin()"><router-link to="userlist">User List</router-link></li>
          <li v-if="isAuthenticated()"><router-link to="Viewer">Viewer</router-link></li>
          <li v-if="isAuthenticated()"><router-link to="logout" @click.native="logout()">Logout</router-link></li>
        </ul>
      </div>
    </div>
  </nav>

  <div class="container">
    <router-view></router-view>
  </div>
  <div id="footer">
    {{footInfo}}
  </div>
</div>
</template>

<script>
import auth from './auth'

export default {

  data () {
    return {
      footInfo: null
    }
  },
  updated () {
    this.footInfo = auth.getAuthHeader()
  },
  methods: {
    logout () {
      auth.logout(this)
    },
    isAuthenticated () {
      return auth.isAuthenticated()
    },
    isAdmin () {
      return auth.isAdmin()
    }
  }
}
</script>

<style scoped>
div#footer {
  text-align: center;
  color: rgb(202, 202, 202);
}
</style>
