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
  [types.SET_CUSTOM_TITLE]: (state, title) => {
    state.customTitle = title
  },
  [types.SET_WS]: (state, ws) => {
    state.ws = ws
  },
  [types.LEAVE_ROOM]: (state) => {
    state.ws = ''
    state.messages = []
  },
  [types.SET_MESSAGE]: (state, messages) => {
    state.messages = messages
  },
  [types.ADD_MESSAGE]: (state, data) => {
    state.messages.push(data)
  },
  [types.UPDATE_PERSONAL_SETTING]: (state, setting) => {
    state.personal_setting = setting
  }
}
