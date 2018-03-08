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
  [types.SET_MESSAGE]: (state, messages) => {
    if (messages.length === 0) {
      state.rooms = {1: []}
    } else {
      let msgArray = state.rooms
      const roomId = messages[0].receivers
      if (state.rooms[roomId]) {
        msgArray = state.rooms[roomId]
      } else {
        msgArray = []
        Vue.set(state.rooms, roomId, msgArray)
      }
      msgArray = msgArray.concat(messages)
      Vue.set(state.rooms, roomId, msgArray)
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
  }
}
