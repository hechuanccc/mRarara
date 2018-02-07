import Vue from 'vue'
import axios from 'axios'
import App from './App'
import router from './router'
import VueCookie from 'vue-cookie'
import { createStore } from './store'
import { sync } from 'vuex-router-sync'
import { fetchSystemConfig } from './api'
import * as types from './store/mutations/mutation-types'
import Vue2Filters from 'vue2-filters'
import qs from 'qs'

let url = window.location.href
let params = qs.parse(url.slice(url.indexOf('?') + 1, url.indexOf('#')))
if (params.r) {
  VueCookie.set('r', params.r, {expires: '1M'})
}

Vue.use(require('vue-moment'))
Vue.use(Vue2Filters)
Vue.use(VueCookie)

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
  const status = error.response.status
  if (status !== 401 && status !== 403) {
    return Promise.reject(error)
  }
  toLogin(router)
  return Promise.reject(error)
})

Vue.config.productionTip = false

const store = createStore()

const toLogin = function (router) {
  router.push({
    path: '/login'
  })
}

router.beforeEach((to, from, next) => {
  store.commit(types.UPDATE_LOADING, {isLoading: true})
  next()
})

let firstEnter = true
router.beforeEach((to, from, next) => {
  if (firstEnter && to.meta.requiresAuth === true) {
    store.dispatch('fetchUser').then(res => {
      firstEnter = false
      next()
    }).catch(() => {
      toLogin(router)
    })
  } else {
    next()
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
        lotteryResultUrl: pref.lottery_result_url
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
