'use strict'
const config = require('../../config')
const env = process.env.NODE_ENV === 'development' ? config.dev.env : config.build.env
const host = env.HOST.replace(/"/g, '')
const ghost = env.ghost.replace(/"/g, '')
const decode = env.decode_key

export default {
  host: host,
  login: host + '/login/',
  register: host + '/v1/register/',
  user: host + '/v1/token/identity/',
  logout: host + '/logout/',
  chatEmoji: host + '/v1/emoji/',
  sendFileChat: host + '/v1/media/',
  annoucement: host + '/v1/member/announcement/',
  check_username: host + '/v1/user/check/',
  systemConfig: host + '/v1/global-data/',
  changeUserInfo: host + '/v1/member/user/',
  latest_results: ghost + '/latest_results/',
  chatlist: host + '/v1/member/user/chat_list/?offset=0&limit=50',
  setCookie: host + '/set_cookie/',
  decode,
  buildRoom: host + '/v1/room/',
  envelope: host + '/v1/envelope/',
  stickers: host + '/v1/stickers/',
  checkin: host + '/v1/member/checkin/',
  game: host + '/v1/member/game/',
  prediction: host + '/v1/member/prediction/'
}
