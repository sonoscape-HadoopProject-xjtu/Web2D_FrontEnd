<template>
  <div class='col-sm-4 col-sm-offset-4'>
    <h2>Sign Up</h2>
    <div class='alert alert-danger' v-if='error'>
      <p>{{ error }}</p>
    </div>
    <div class='form-group'>
      <input
        type='text'
        class='form-control'
        placeholder='Enter your authorization code'
        v-model='credentials.authorization_code'
        v-on:keyup.enter='submit'
      >
    </div>
    <div class='form-group'>
      <input
        type='text'
        class='form-control'
        placeholder='Enter your name'
        v-model='credentials.username'
        v-on:keyup.enter='submit'
      >
    </div>
    <div class='form-group'>
      <input
        type='text'
        class='form-control'
        placeholder='Enter your userid'
        v-model='credentials.userid'
        v-on:keyup.enter='submit'
      >
    </div>
    <div class='form-group'>
      <input
        type='password'
        class='form-control'
        placeholder='Enter your password'
        v-model='credentials.password'
        v-on:keyup.enter='submit'
      >
    </div>
    <div class='form-group'>
      <input
        type='password'
        class='form-control'
        placeholder='repeat your password'
        v-model='credentials.password_repeat'
        v-on:keyup.enter='submit'
      >
    </div>
    <button class='btn btn-primary' @click='submit'>Signup</button>
  </div>
</template>

<script>
import auth from '../auth'

export default {
  data () {
    return {
      credentials: {
        username: '',
        userid: '',
        password: '',
        password_repeat: '',
        authorization_code: ''
      },
      error: ''
    }
  },
  methods: {
    submit () {
      if (this.credentials.authorization_code === '' || this.credentials.username === '') {
        this.error = '认证码不能为空'
        return
      }
      if (this.credentials.password === '' || this.credentials.userid === '' || this.credentials.username === '') {
        this.error = '用户名或密码不能为空'
        return
      }
      if (this.credentials.password !== this.credentials.password_repeat) {
        this.error = '两次密码不一致'
        return
      }
      var credentials = {
        username: this.credentials.username,
        userid: this.credentials.userid,
        userpassword: this.credentials.password,
        authorization_code: this.credentials.authorization_code
      }
      auth.signup(this, credentials, 'login')
    }
  }
}
</script>
