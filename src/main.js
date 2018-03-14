import Vue from 'vue'
import axios from 'axios'
import App from './App'
import router from './router'
import VueCookie from 'vue-cookie'
import { createStore } from './store'
import { sync } from 'vuex-router-sync'
import { fetchSystemConfig, setCookie } from './api'
import * as types from './store/mutations/mutation-types'
import Vue2Filters from 'vue2-filters'
import qs from 'qs'
import { ToastPlugin } from 'vux'

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
      toLogin(router)
    } else if (error.response.status !== 587) {
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

const store = createStore()

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
  store.commit(types.UPDATE_LOADING, {isLoading: true})
  next()
})

const isCommonMember = (roles) => {
  return roles.every(role => role.id !== 4 && role.id !== 1)
}

router.beforeEach((to, from, next) => {
  if (!store.state.user.logined && to.meta.requiresAuth === true) {
    let token = VueCookie.get('access_token')
    if (token) {
      store.dispatch('fetchUser').then(res => {
        if (to.matched[0].path !== '/private' || isCommonMember(res.roles)) {
          next()
        } else {
          next('/chatroom')
        }
      }).catch(() => {
        toLogin(router)
      })
    } else {
      toLogin(router)
    }
  } else {
    if (to.matched[0].path !== '/private' || isCommonMember(store.state.user.roles)) {
      next()
    } else {
      next('/chatroom')
    }
  }
})

router.afterEach(function (to) {
  store.commit(types.UPDATE_LOADING, {isLoading: false})
})

sync(store, router)

Vue.mixin({
  methods: {
    performLogin () {
      toLogin(this.$router)
    }
  }
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
        envelopeSettings: pref.envelope_settings
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
