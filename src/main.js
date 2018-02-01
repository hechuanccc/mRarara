import Vue from 'vue'
import axios from 'axios'
import App from './App'
import router from './router'
import VueCookie from 'vue-cookie'
import { createStore } from './store'
import { sync } from 'vuex-router-sync'
import * as types from './store/mutations/mutation-types'
import Vue2Filters from 'vue2-filters'

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

router.beforeEach((to, from, next) => {
  // fisrMacthed might be the top-level parent route of others
  const firstMatched = to.matched.length ? to.matched[0] : null
  if ((firstMatched || to).meta.requiresAuth) {
    if (from && from.matched[0] && from.matched[0].path === to.matched[0].path) {
      next()
    } else {
      store.dispatch('fetchUser')
        .then(res => {
          // got user info
          if (res.account_type === 0 && to.matched[0].path === '/account') {
            toLogin(router)
          } else {
            next()
          }
        })
        .catch(error => {
          // can't get user info
          toLogin(router)
          return Promise.resolve(error)
        })
    }
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

// gethomePage().then(
//   response => {
//     let pref = response.global_preferences
//     store.dispatch('setSystemConfig',
//       {
//         homePageLogo: response.icon,
//         customerServiceUrl: pref.customer_service_url,
//         agentDashboardUrl: pref.agent_dashboard_url,
//         global_preferences: pref,
//         agentBusinessConsultingQQ: pref.agent_business_consulting_qq,
//         contactEmail: pref.contact_email,
//         contactPhoneNumber: pref.contact_phone_number,
//         openAccountConsultingQQ: pref.open_account_consulting_qq,
//         siteName: response.name
//       })
//   }
// )

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
