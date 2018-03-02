import Vue from 'vue'
import * as types from './mutation-types'

export default {
  [types.SET_USER]: (state, { user }) => {
    Vue.set(state, 'user', {
      ...state.user,
      ...user
    })
  },
  [types.RESET_USER]: (state) => {
    state.user = {
      logined: false
    }
    Vue.cookie.delete('access_token')
    Vue.cookie.delete('refresh_token')
  },
  [types.UPDATE_LOADING]: (state, payload) => {
    state.isLoading = payload.isLoading
  },
  [types.SET_SYSTEM_CONFIG]: (state, data) => {
    state.systemConfig = data
  },
  [types.SET_WS]: (state, ws) => {
    state.ws = ws
  },
  [types.LEAVE_ROOM]: (state) => {
    state.ws = ''
    state.messages = []
  },
  [types.SET_MESSAGE]: (state, messages) => {
    if (messages.length === 0) {
      state.messages = {}
    } else {
      Vue.set(state.messages, messages[0].receivers, messages)
    }
  },
  [types.UPDATE_PERSONAL_SETTING]: (state, setting) => {
    state.personal_setting = setting
  }
}
