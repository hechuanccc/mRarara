import Vue from 'vue'
import * as types from '../mutations/mutation-types'
import {ADMIN, SERVICE, MEMBER, VISITOR} from '../../customConfig'
import axios from 'axios'
import {
  fetchUser,
  login,
  logout,
  fetchChatlist
} from '../../api'

export default {
  login: ({ commit, state, dispatch }, { user }) => {
    return login(user).then(res => {
      if (state.user.logined) {
        logout().catch(() => {})
        commit(types.RESET_USER)
        dispatch('leaveRoom')
      }
      let expires = new Date(res.expires_in)
      if (res.access_token && res.refresh_token) {
        Vue.cookie.set('access_token', res.access_token, {
          expires: expires
        })
        Vue.cookie.set('refresh_token', res.refresh_token, {
          expires: expires
        })
        axios.defaults.withCredentials = true
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + res.access_token
      }
      Vue.nextTick()
      .then(function () {
        commit(types.SET_USER, {
          user: {
            logined: true
          }
        })
      })
      return Promise.resolve(res)
    }, error => {
      return Promise.reject(error)
    })
  },
  logout: ({ commit, state, dispatch }) => {
    logout().catch(() => {})
    commit(types.RESET_USER)
    dispatch('leaveRoom')
  },
  fetchUser: ({ commit, state, dispatch }) => {
    return fetchUser().then(res => {
      let roles = res.roles
      let viewRole = MEMBER
      for (let i = 0, length = roles.length; i < length; i++) {
        let role = roles[i]
        if (role.id === 5) {
          viewRole = VISITOR
          break
        } else if (role.id === 1) {
          viewRole = ADMIN
          break
        } else if (role.id === 4) {
          viewRole = SERVICE
          break
        }
      }
      if (!res.error) {
        commit(types.SET_USER, {
          user: {
            ...res,
            logined: true,
            viewRole: viewRole
          }
        })
        if (state.chatlist.length === 0) {
          if (viewRole === MEMBER) {
            dispatch('initChatlist').catch(() => {})
          }
        }
        return Promise.resolve(res)
      } else {
        return Promise.reject(res)
      }
    }, error => {
      commit(types.SET_USER, {
        user: {
          logined: false
        }
      })
      return Promise.reject(error)
    })
  },
  setSystemConfig: ({ commit }, data) => {
    commit(types.SET_SYSTEM_CONFIG, data)
  },
  setWs: ({ commit }, ws) => {
    commit(types.SET_WS, ws)
  },
  leaveRoom: ({ commit, state }) => {
    state.ws.send(JSON.stringify({
      'command': 'leave',
      'receivers': [1]
    }))
    state.ws.onclose = null
    state.ws.close()
    commit(types.LEAVE_ROOM)
  },
  initMessage: ({ commit }, setting) => {
    commit(types.INIT_MESSAGE, setting)
  },
  addMessage: ({ commit }, setting) => {
    commit(types.ADD_MESSAGE, setting)
  },
  initPersonalSetting: ({ commit }, setting) => {
    commit(types.INIT_PERSONAL_SETTING, setting)
  },
  updatePersonalSetting: ({ commit }, type) => {
    commit(types.UPDATE_PERSONAL_SETTING, type)
  },
  setAnnouncement: ({commit}, announcement) => {
    commit(types.SET_ANNOUNCE, announcement)
  },
  initChatlist: ({commit}, chatlist) => {
    return fetchChatlist().then(chatlist => {
      commit(types.INIT_CHATLIST, chatlist)
    })
  },
  updateReadStatus: ({commit}, setting) => {
    commit(types.UPDATE_READ_STATUS, setting)
  },
  updateEnvelope: ({commit}, setting) => {
    commit(types.UPDATE_ENVELOPE, setting)
  },
  initEmoji: ({commit}, setting) => {
    commit(types.INIT_EMOJI, setting)
  }
}
