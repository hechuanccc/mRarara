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
    state.chatlist = []
    state.unreadRooms = {}
    state.envelope = {}
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
    state.rooms = {1: []}
  },
  [types.INIT_MESSAGE]: (state, {roomId, messages}) => {
    if (messages.length === 0) {
      state.rooms = {1: []}
    } else {
      Vue.set(state.rooms, roomId, messages)
    }
  },
  [types.ADD_MESSAGE]: (state, {roomId, message}) => {
    if (state.rooms[roomId]) {
      state.rooms[roomId].push(message)
    } else {
      Vue.set(state.rooms, roomId, [message])
    }
  },
  [types.SET_ANNOUNCE]: (state, announcement) => {
    state.announcement = announcement
  },
  [types.INIT_PERSONAL_SETTING]: (state, setting) => {
    state.personal_setting.reasons = setting.reasons || []
    state.personal_setting.banned = setting.banned
    state.personal_setting.blocked = setting.blocked
  },
  [types.UPDATE_PERSONAL_SETTING]: (state, type) => {
    switch (type) {
      case 'unblocked':
        state.personal_setting.blocked = false
        break
      case 'unbanned':
        state.personal_setting.banned = false
        break
      case 'blocked':
        state.personal_setting.blocked = true
        break
      case 'banned':
        state.personal_setting.banned = true
        break
    }
  },
  [types.INIT_CHATLIST]: (state, chatlist) => {
    state.chatlist = chatlist
    const unreadRooms = {}
    chatlist.forEach(member => {
      unreadRooms[member.id] = member.read
    })
    state.unreadRooms = unreadRooms
  },
  [types.UPDATE_READ_STATUS]: (state, {id, status}) => {
    if (state.unreadRooms[id] !== undefined) {
      state.unreadRooms[id] = status
    }
  },
  [types.UPDATE_ENVELOPE]: (state, {id, data}) => {
    if (!state.envelope[id]) {
      Vue.set(state.envelope, id, data)
    } else {
      Object.assign(state.envelope[id], data)
    }
  }
}
