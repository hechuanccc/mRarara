import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'

Vue.use(Vuex)

export function createStore () {
  return new Vuex.Store({
    state: {
      user: {
        logined: ''
      },
      isLoading: false,
      systemConfig: {
        mobileLotteryUrl: '',
        customerServiceUrl: '',
        webLotteryRegisterUrl: '',
        lotteryResultUrl: ''
      },
      customTitle: '',
      ws: '',
      messages: [],
      personal_setting: {
        chat: {
          reasons: [],
          status: ''
        },
        manager: true
      }
    },
    actions,
    mutations,
    getters
  })
}
