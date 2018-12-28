const API_URL = process.env.API_ROOT + '/user/'
const LOGIN_URL = API_URL + 'login'
const SIGNUP_URL = API_URL + 'signup'
const UPDATE_URL = API_URL + 'update'
export default {

  login (context, creds, redirect) {
    context.$http.post(LOGIN_URL, creds).then(response => {
      if (response.body.status) {
        localStorage.setItem('id_token', JSON.stringify(response.body.id_token))
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
        alert('注册成功，请登录！')
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

  update (context, creds, redirect) {
    context.$http.post(UPDATE_URL, creds).then(response => {
      if (response.body.status) {
        alert('修改成功！')
        context.$router.go(0)
      } else {
        alert(response.body.message)
      }
    }, response => {
      alert(response.statusText)
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
    var userObj = localStorage.getItem('id_token')
    if (userObj) {
      return true
    }
    return false
  },

  isAdmin () {
    var userObj = JSON.parse(localStorage.getItem('id_token'))
    if (userObj) {
      if (userObj.usergroup === 'administrator') {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  },

  getAuthHeader () {
    var userObj = JSON.parse(localStorage.getItem('id_token'))
    if (userObj) {
      return '当前用户：' + userObj.username + '  所属用户组：' + (userObj.usergroup === 'administrator' ? '管理员' : '一般用户')
    } else {
      return ''
    }
  }
}
