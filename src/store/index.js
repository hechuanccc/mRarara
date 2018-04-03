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
      stickerGroups: [],
      checkin_settings: {
        single_day_amount: undefined
      }
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
    envelope: {},
    today: new Date()
  },
  actions,
  mutations,
  getters
})
