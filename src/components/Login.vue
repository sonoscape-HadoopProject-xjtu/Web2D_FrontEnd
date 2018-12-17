<template>
  <div class="col-sm-4 col-sm-offset-4">
    <h2>Log In</h2>
    <div class="alert alert-danger" v-if="error">
      <p>{{ error }}</p>
    </div>
    <div class="form-group">
      <input
        type="text"
        class="form-control"
        placeholder="Enter your userid"
        v-model="credentials.userid"
        v-on:keyup.enter="submit"
      >
    </div>
    <div class="form-group">
      <input
        type="password"
        class="form-control"
        placeholder="Enter your password"
        v-model="credentials.userpassword"
        v-on:keyup.enter="submit"
      >
    </div>
    <button class="btn btn-primary" @click="submit">Login</button>
  </div>
</template>

<script>
import auth from '../auth'

export default {
  data () {
    return {
      credentials: {
        userid: '',
        userpassword: ''
      },
      error: ''
    }
  },
  methods: {
    submit () {
      var credentials = {
        userid: this.credentials.userid,
        userpassword: this.credentials.userpassword
      }
      auth.login(this, credentials, 'secretquote')
    }
  }
}
</script>
