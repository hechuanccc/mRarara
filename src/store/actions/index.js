import Vue from 'vue'
import * as types from '../mutations/mutation-types'
import router from '../../router'
import axios from 'axios'
import {
  fetchUser,
  login,
  logout
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
      }
      commit(types.SET_USER, {
        user: {
          logined: true
        }
      })
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
  fetchUser: ({ commit, state }) => {
    return fetchUser().then(res => {
      if (!res.error) {
        commit(types.SET_USER, {
          user: {
            ...res,
            logined: true
          }
        })
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
  setCustomTitle: ({ commit }, title) => {
    commit(types.SET_CUSTOM_TITLE, title)
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
  addMessage: ({ commit }, data) => {
    commit(types.ADD_MESSAGE, data)
  },
  updatePersonalSetting: ({ commit }, setting) => {
    commit(types.UPDATE_PERSONAL_SETTING, setting)
  }
}
