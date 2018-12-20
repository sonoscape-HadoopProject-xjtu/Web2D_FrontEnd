const API_URL = '/api/user/'
const LOGIN_URL = API_URL + 'login'
const SIGNUP_URL = API_URL + 'signup'

export default {

  login (context, creds, redirect) {
    context.$http.post(LOGIN_URL, creds).then(response => {
      if (response.body.status) {
        localStorage.setItem('id_token', JSON.stringify(response.body.id_token))
        console.log(response.body.id_token)
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
      localStorage.removeItem('id_token')
      context.$router.replace('/')
    } else {
      context.$router.go(-1)
    }
  },

  isAuthenticated () {
    var jwt = localStorage.getItem('id_token')
    if (jwt) {
      return true
    }
    return false
  },

  getAuthHeader () {
    return {
      'Authorization': 'Bearer ' + localStorage.getItem('id_token')
    }
  }
}
