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
    systemConfig: {
      mobileLotteryUrl: '',
      customerServiceUrl: '',
      webLotteryRegisterUrl: '',
      lotteryResultUrl: '',
      envelopeSettings: {},
      stickerGroups: [],
      checkinSettings: {}
    },
    emojis: {
      symbol: []
    },
    ws: '',
    hearbeat: null,
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
