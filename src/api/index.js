import axios from 'axios'
import urls from './urls'
import qs from 'qs'

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

export function login (user) {
  return axios.post(urls.login, qs.stringify(user))
}
export function logout () {
  return axios.post(urls.logout)
}

export function fetchUser () {
  return axios.get(urls.user)
}

export function fetchChatlist () {
  return axios.get(urls.chatlist).then(data => data.results)
}

export function register (user) {
  return axios.post(urls.register, qs.stringify(user), {withCredentials: true})
}

export function sendImgToChat (data) {
  return axios.post(`${urls.sendImgToChat}`, data)
}

export function checkUserName (username) {
  return axios.get(urls.check_username, { params: { username: username } })
}

export function fetchSystemConfig () {
  return axios.get(urls.systemConfig)
}

export function changeUserInfo (id, data) {
  return axios.put(`${urls.changeUserInfo}${id}/`, data)
}

export function fetchAnnouce () {
  return axios.get(`${urls.annoucement}`)
}

export function fetchChatEmoji () {
  return axios.get(`${urls.chatEmoji}`)
}

export function setCookie (cookie) {
  return axios.post(urls.setCookie, {cookie}, { 'Content-Type': 'application/json', withCredentials: true })
}

export function buildRoom (users) {
  return axios.post(urls.buildRoom, {
    type: 2,
    status: '1',
    last_message: '',
    users: users
  }, {
    'Content-Type': 'application/json'
  })
}

export function fetchEnvelopeRecord ({offset, limit}) {
  return axios.get(`${urls.envelope}?offset=${offset}&limit=${limit}`)
}

export function sendEnvelope (data) {
  return axios.post(urls.envelope, data, {
    'Content-Type': 'application/json'
  })
}

export function takeEnvelope (envelopId, userId) {
  return axios.put(`${urls.envelope}${envelopId}/`, {
    receiver_id: userId
  }, {
    'Content-Type': 'application/json'
  })
}

export function fetchStickers (name) {
  return axios.get(`${urls.stickers}?group=${name}`)
}

export function fetchCheckinRecord ({offset, limit}) {
  return axios.get(`${urls.checkin}?offset=${offset}&limit=${limit}`)
}

export function checkin () {
  return axios.post(urls.checkin, {platform: 1}, {
    'Content-Type': 'application/json'
  })
}
