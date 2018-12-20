const API_URL = '/api/user/'
const LOGIN_URL = API_URL + 'login'
const SIGNUP_URL = API_URL + 'signup'

export default {

  login (context, creds, redirect) {
    context.$http.post(LOGIN_URL, creds).then(response => {
      if (response.body.status) {
        sessionStorage.setItem('id_token', JSON.stringify(response.body.id_token))
        if (redirect) {
          context.$router.replace(redirect)
        }
      } else {
        context.error = response.body.message
      }
    }, response => {
      context.error = response.statusText
    })
  },

  signup (context, creds, redirect) {
    context.$http.post(SIGNUP_URL, creds).then(response => {
      if (response.body.status) {
        if (redirect) {
          alert('注册成功，请登录！')
          context.$router.replace(redirect)
        }
      } else {
        context.error = response.body.message
      }
    }, response => {
      context.error = response.statusText
    })
  },

  logout (context) {
    var res = confirm('确认退出？')
    if (res) {
      sessionStorage.removeItem('id_token')
      context.$router.replace('/')
    } else {
      context.$router.go(-1)
    }
  },

  isAuthenticated () {
    var userOdj = sessionStorage.getItem('id_token')
    if (userOdj) {
      return true
    }
    return false
  },

  isAdmin () {
    var userOdj = JSON.parse(sessionStorage.getItem('id_token'))
    if (userOdj) {
      if (userOdj.usergroup === 'administrator') {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  },

  getAuthHeader () {
    return {
      'Authorization': 'Bearer ' + sessionStorage.getItem('id_token')
    }
  }
}
