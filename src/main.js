import Vue from 'vue'
import axios from 'axios'
import App from './App'
import router from './router'
import VueCookie from 'vue-cookie'
import store from './store'
import { sync } from 'vuex-router-sync'
import { fetchSystemConfig, setCookie, fetchChatEmoji, register } from './api'
import Vue2Filters from 'vue2-filters'
import qs from 'qs'
import { ToastPlugin } from 'vux'
import { VISITOR } from './customConfig'

Vue.use(require('vue-moment'))
Vue.use(Vue2Filters)
Vue.use(VueCookie)
Vue.use(ToastPlugin, {position: 'middle', timing: 3000})

let url = window.location.href
let params = qs.parse(url.slice(url.indexOf('?') + 1, url.length))

if (params.r) {
  setCookie('r=' + params.r).catch(() => {})
}

if (params.desktop === '1' && Vue.cookie.get('desktop') !== '1') {
  VueCookie.set('desktop', params.desktop)
  window.location.reload()
}

const token = Vue.cookie.get('access_token')
if (token) {
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
}

axios.interceptors.response.use(res => {
  let responseData = res.data
  if (!responseData.error) {
    return responseData
  } else {
    toLogin(router)
    return Promise.reject(responseData)
  }
}, (error) => {
  if (!error.response) {
    Vue.$vux.toast.show({
      text: '系统发生了错误, 请联系客服',
      type: 'warn'
    })
  } else {
    const status = error.response.status
    if (status === 401 || status === 403) {

    } else if (error.response.status !== 587) {
      if (error.response.status === 503) {
        router.replace({
          path: '/error'
        })
        return Promise.reject(error)
      }
      let msg = error.response.data.error
      if (!msg) {
        msg = '系统发生了错误, 请联系客服'
      }
      Vue.$vux.toast.show({
        text: msg,
        type: 'warn'
      })
      let errRes = {response: {data: '系统发生了错误, 请联系客服'}}
      return Promise.reject(errRes)
    }
  }
  return Promise.reject(error)
})

Vue.config.productionTip = false

const toLogin = function (router) {
  store.commit('RESET_USER')
  if (store.state.ws) {
    store.dispatch('leaveRoom')
  }
  router.push({
    path: '/login'
  })
}

router.beforeEach((to, from, next) => {
  document.title = `彩票计划聊天室 - ${to.meta.title}`
  if (to.path === '/login' || to.path === '/register' || to.path === '/error') {
    next()
    return
  }
  const loginedPromise = new Promise((resolve, reject) => {
    if (!store.state.user.logined) {
      const token = Vue.cookie.get('access_token')
      if (token) {
        store.dispatch('fetchUser').then(res => {
          resolve()
        }).catch(() => {
          register({visitor: true}).then(result => {
            return store.dispatch('login', {
              user: {
                username: result.username,
                password: result.password
              }
            })
          }).then(result => {
            store.dispatch('fetchUser').then(res => {
              resolve()
            })
          }).catch(err => { reject(err) })
        })
      } else {
        register({visitor: true}).then(result => {
          return store.dispatch('login', {
            user: {
              username: result.username,
              password: result.password
            }
          })
        }).then(result => {
          store.dispatch('fetchUser').then(res => {
            resolve()
          }).catch(err => { reject(err) })
        })
      }
    } else {
      resolve()
    }
  })

  loginedPromise.then(() => {
    if (to.meta.requiresAuth && store.state.user.viewRole === VISITOR) {
      next('/login')
    } else {
      next()
    }
  }).catch(() => {
    next('/login')
  })
})

sync(store, router)

Vue.mixin({
  methods: {
    performLogin () {
      toLogin(this.$router)
    }
  }
})
fetchChatEmoji().then(response => {
  store.dispatch('initEmoji', {id: 'symbol', emojis: response.people.slice(0, 42)})
})
fetchSystemConfig().then(
  response => {
    let pref = response.global_preferences
    store.dispatch('setSystemConfig',
      {
        mobileLotteryUrl: pref.mobile_lottery_url,
        customerServiceUrl: pref.customer_service_url,
        webLotteryRegisterUrl: pref.web_lottery_register_url,
        lotteryResultUrl: pref.lottery_result_url,
        logo: pref.logo,
        mobileBackground: pref.mobile_background,
        mobileUrl: pref.mobile_url,
        privateChatBlockedUsers: pref.private_chat_blocked_users,
        title: pref.title,
        envelopeSettings: pref.envelope_settings || {},
        stickerGroups: response.sticker_groups || [],
        checkinSettings: pref.checkin_settings || {}
      })
  }
)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
