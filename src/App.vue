<template>
  <view-box
    class='content-box'
    :body-padding-top="user.logined?'44px':'46px'"
    body-padding-bottom="0">
    <div
      v-if="user.logined"
      class="tab-content"
      slot="header"
      :style="{
        width: '100%',
        position: 'fixed', // lay over the default
        left:'0',
        top:'0',
        'z-index':'100'
      }">
      <tab :line-width="2" active-color="#fc378c">
        <tab-item
          :badge-label="page.path === '/private' && unreadCount ? unreadCount+'' : ''"
          class="vux-center"
          :selected="`/${$route.path.split('/')[1]}` === page.path"
          v-for="(page, index) in pages"
          @on-item-click="switchTab(page.path)"
          :key="index">{{page.name}}</tab-item>
      </tab>
    </div>
    <x-header
      v-else
      :left-options="{showBack: false}"
      slot="header"
      :style="{
        width: '100%',
        position: 'fixed', // lay over the default
        left:'0',
        top:'0',
        'z-index':'100'
      }">彩票计划聊天室</x-header>
    <router-view :key="$route.path"></router-view>
  </view-box>
</template>

<script>
import { XHeader, ViewBox, Tab, TabItem, Swiper, SwiperItem, AlertModule } from 'vux'
import { mapGetters, mapState } from 'vuex'
import { fetchAnnouce } from './api'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/user-circle'
import config from '../config'
export default {
  name: 'app',
  components: {
    ViewBox,
    Tab,
    TabItem,
    Swiper,
    SwiperItem,
    Icon,
    AlertModule,
    XHeader
  },
  data () {
    return {
      index: 0,
      showAccountPanel: false,
      ws: undefined
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ]),
    ...mapState([
      'systemConfig', 'chatlist'
    ]),
    unreadCount () {
      const chatWithId = this.$route.params.chatWithId
      const unreadRooms = this.$store.state.unreadRooms
      const ids = Object.keys(unreadRooms)
      return ids.filter(id => {
        return !unreadRooms[id] && chatWithId !== id
      }).length
    },
    avatar () {
      return {
        'background-image': `url(${this.user.avatar})`
      }
    },
    pages () {
      if (this.user.roles) {
        let roles = this.user.roles
        for (let i = 0, length = roles.length; i < length; i++) {
          let role = roles[i]
          if (role.id === 1 || role.id === 4) {
            return [{
              name: '计划聊天室',
              path: '/chatroom'
            },
            {
              name: '开奖',
              path: '/results'
            },
            {
              name: '帐户',
              path: '/my'
            }]
          }
        }
      }
      return [{
        name: '计划聊天室',
        path: '/chatroom'
      },
      {
        name: '联系客服',
        path: '/private'
      },
      {
        name: '开奖',
        path: '/results'
      },
      {
        name: '帐户',
        path: '/my'
      }]
    },
    chatWithTitle () {
      const chatWithId = parseInt(this.$route.params.chatWithId)
      if (chatWithId) {
        const index = this.$store.state.chatlist.findIndex(member => member.id === chatWithId)
        if (index !== -1) {
          return `客服人员${index + 1}`
        }
      }
      return ''
    }
  },
  watch: {
    '$route': function (to, from) {
      if (to.path === '/') {
        this.$router.replace({path: '/chatroom'})
      }
    },
    'user.logined': function (logined) {
      if (logined) {
        this.initWebSocket()
      }
    }
  },
  created () {
    fetchAnnouce().then(result => {
      result.forEach((item) => {
        if (item.platform !== 0) {
          this.$store.dispatch('setAnnouncement', [item.content])
        }
      })
    })
  },
  methods: {
    closeAccountPanel () {
      this.showAccountPanel = false
    },
    switchTab (path) {
      this.$router.push({path})
    },
    initWebSocket () {
      let token = this.$cookie.get('access_token')
      const ws = new WebSocket(`${config.chatHost}/chat/stream?token=${token}`)
      ws.onopen = () => {
        this.$store.dispatch('setWs', ws)
        ws.send(JSON.stringify({
          'command': 'join',
          'receivers': [1]
        }))
        const hearbeat = setInterval(() => {
          ws.send(JSON.stringify({
            'command': 'live',
            'user_id': this.user.id
          }))
        }, 60000)
        ws.onclose = () => {
          if (this.user.logined) {
            this.$store.commit('RESET_USER')
            this.$router.push({
              path: '/login'
            })
          }
          clearInterval(hearbeat)
        }
        ws.onmessage = (resData) => {
          let data
          if (typeof resData.data === 'string') {
            try {
              data = JSON.parse(resData.data)
              if (data.personal_setting) {
                this.$store.dispatch('initPersonalSetting', data.personal_setting)
              } else if (!data.error_type) {
                // 只顯示目前房間的歷史訊息
                if (data.latest_message && data.latest_message.length > 0) {
                  this.$store.dispatch('initMessage', {
                    roomId: data.room_id,
                    messages: data.latest_message.length === 0 ? [] : data.latest_message.reverse()
                  })
                  return
                } else {
                  switch (data.type) {
                    case 0:
                    case 1:
                      this.$store.dispatch('updateReadStatus', {id: data.sender.id, status: false})
                      this.$store.dispatch('addMessage', {roomId: data.receivers, message: data})
                      break
                    case 2:
                      const command = data.command
                      if (command === 'unbanned' || command === 'unblock') {
                        this.$store.dispatch('updatePersonalSetting', command)
                        if (this.$route.path === '/chatroom') {
                          AlertModule.show({
                            content: data.content
                          })
                        }
                        if (command === 'unblock') {
                          ws.send(JSON.stringify({
                            'command': 'join',
                            'receivers': [1]
                          }))
                        }
                      }
                      break
                    case 3:
                      let announcement = this.$store.state.announcement
                      announcement = announcement.push(data.content)
                      this.$store.dispatch('setAnnouncement', announcement)
                      break
                    case 5:
                      this.$store.dispatch('addMessage', {roomId: data.receivers, message: data})
                      break
                    case 6:
                      const envelopeStatue = data.envelope_status
                      const setting = {users: envelopeStatue.users, remaining: envelopeStatue.remaining}
                      if (envelopeStatue.remaining === 0) {
                        setting.status = 3
                      }
                      this.$store.dispatch('updateEnvelope', {id: envelopeStatue.id, data: setting})
                      const nickname = data.get_envelope_user.id === this.user.id ? '你' : data.get_envelope_user.nickname
                      if (data.sender.id === this.user.id) {
                        this.$store.dispatch('addMessage', {roomId: 1, message: {type: -1, content: nickname + '领取了你的红包'}})
                      }
                      break
                  }
                }
              } else {
                switch (data.error_type) {
                  case 4:
                    this.$store.dispatch('updatePersonalSetting', 'banned')
                    if (this.$route.path === '/chatroom') {
                      AlertModule.show({
                        content: '您已被聊天室管理员禁言，在' + this.$moment(data.msg).format('YYYY-MM-DD HH:mm:ss') + '后才可以发言。'
                      })
                    }
                    break
                  case 5:
                    this.$store.dispatch('addMessage', {messages: []})
                    this.$store.dispatch('updatePersonalSetting', 'blocked')
                    if (this.$route.path === '/chatroom') {
                      AlertModule.show({
                        content: data.msg
                      })
                    }
                    break
                  case 6:
                    this.$vux.toast.show({
                      text: data.msg,
                      type: 'warn'
                    })
                    setTimeout(() => {
                      this.$router.push({name: 'Login'})
                    }, 3000)
                    break
                  default:
                    if (data.error_type !== 3 && data.error_type !== 2) {
                      AlertModule.show({
                        content: data.msg
                      })
                    }
                }
              }
            } catch (e) {
              console.log(e)
            }
          }
        }
      }
    }
  },
  beforeDestroy () {
    let ws = this.$store.state.ws
    if (ws) {
      this.$store.dispatch('leaveRoom')
    }
  }
}
</script>

<style lang="less">
@import '~vux/src/styles/reset.less';
@import './styles/theme.less';
@import './styles/base.less';
</style>

<style lang="less" scoped>

.content-box {
  width: 100%;
  .tab-content {
    .vux-tab {
      z-index: 999;
    }
  }
  & /deep/ .vux-header{
    background-color: #383636;
  }
  & /deep/ .vux-header-left {
  }
  & /deep/ .vux-header-title {
    margin: 0;
  }
  .chat-logo {
    float: left;
    margin-left: 10px;
    margin-top: 2px;
    img {
      width: 120px;
      height: 30px;
    }
  }
  .default-avatar,.avatar {
    width: 30px;
    height: 30px;
    background-repeat: no-repeat;
    background-size: contain;
  }
  .default-avatar {
    background-image: url('./assets/avatar.png')
  }
  .user-name {
    font-size: 14px;
    padding: 0 10px;
  }
  .user-info {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 100%;
  }
  .logout {
    width: 40px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    font-size: 14px;
    font-weight: 200;
    letter-spacing: 2px;
  }
}

.vux-header.home {
  display: flex;
  justify-content: space-between;
  & /deep/ .vux-header-left {
    position: static;
  }
  & /deep/ .vux-header-right {
    position: static;
    display: flex;
    .group {
      order: 1;
      height: 100%;
      display: flex;
      align-items: center;
    }
    .vux-header-more {
      width: 40px;
      margin:0;
      order: 2;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
