import Vue from 'vue'
import * as types from '../mutations/mutation-types'
import router from '../../router'
import axios from 'axios'
import {
  fetchUser,
  login,
  logout,
  fetchChatlist
} from '../../api'

export default {
  login: ({ commit, state }, { user }) => {
    return login(user).then(res => {
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
        commit(types.SET_USER, {
          user: {
            logined: true
          }
        })
      }
      return Promise.resolve(res)
    }, error => {
      return Promise.reject(error)
    })
  },
  logout: ({ commit, state, dispatch }) => {
    return logout().then(
      res => {
        dispatch('leaveRoom')
        router.push('/')
        Vue.cookie.delete('access_token')
        Vue.cookie.delete('refresh_token')
        commit(types.RESET_USER)
      },
      errRes => Promise.reject(errRes)
    )
  },
  fetchUser: ({ commit, state, dispatch }) => {
    return fetchUser().then(res => {
      if (!res.error) {
        commit(types.SET_USER, {
          user: {
            ...res,
            logined: true
          }
        })
        if (state.chatlist.length === 0) {
          if (!res.roles.some(role => { return role.id === 4 || role.id === 1 })) {
            fetchChatlist().then(chatlist => {
              dispatch('initChatlist', chatlist)
            })
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
    state.ws.close()
    commit(types.LEAVE_ROOM)
  },
  setMessage: ({ commit }, messages) => {
    commit(types.SET_MESSAGE, messages)
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
    commit(types.INIT_CHATLIST, chatlist)
  },
  updateReadStatus: ({commit}, setting) => {
    commit(types.UPDATE_READ_STATUS, setting)
  },
  setChatWith: ({commit}, options) => {
    commit(types.SET_CHATWITH, options)
  }
}
