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
        logined: false
      },
      isLoading: false,
      systemConfig: {
        mobileLotteryUrl: '',
        customerServiceUrl: '',
        webLotteryRegisterUrl: '',
        lotteryResultUrl: ''
      },
      ws: '',
      rooms: {},
      personal_setting: {
        banned: false,
        blocked: false,
        reasons: []
      },
      announcement: [],
      unreadRooms: {},
      chatlist: [],
      chatWith: {
        username: '',
        title: ''
      }
    },
    actions,
    mutations,
    getters
  })
}
