'use strict'
const config = require('../../config')
const env = process.env.NODE_ENV === 'development' ? config.dev.env : config.build.env
const host = env.HOST.replace(/"/g, '')
const ghost = 'http://a546542.eastasia.cloudapp.azure.com:8000'
const decode = env.decode_key

export default {
  host: host,
  login: host + '/login/',
  register: host + '/v1/register/',
  user: host + '/v1/token/identity/',
  logout: host + '/logout/',
  chatEmoji: host + '/v1/emoji/',
  sendImgToChat: host + '/v1/image/',
  annoucement: host + '/v1/member/announcement/',
  check_username: host + '/v1/user/check/',
  systemConfig: host + '/v1/global-data/',
  changeUserInfo: host + '/v1/member/user/',
  latest_results: ghost + '/latest_results/',
  memberRoom: host + '/v1/member/room/',
  setCookie: host + '/set_cookie/',
  decode
}
