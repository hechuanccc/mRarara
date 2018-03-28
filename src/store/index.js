import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: {
      logined: false
    },
    isLoading: false,
    systemConfig: {
      mobileLotteryUrl: '',
      customerServiceUrl: '',
      webLotteryRegisterUrl: '',
      lotteryResultUrl: '',
      envelopeSettings: {},
      stickerGroups: []
    },
    emojis: {
      symbol: []
    },
    ws: '',
    rooms: {
      1: []
    },
    personal_setting: {
      banned: false,
      blocked: false,
      reasons: []
    },
    announcement: [],
    unreadRooms: {},
    chatlist: [],
    envelope: {}
  },
  actions,
  mutations,
  getters
})
