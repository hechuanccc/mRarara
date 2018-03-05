<template>
  <view-box
    class='content-box'
    :body-padding-top="$route.meta.tabbarHidden?'40px':'84px'"
    body-padding-bottom="0">
    <div
      slot="header"
      :style="{
        width: '100%',
        position: 'fixed', // lay over the default
        left:'0',
        top:'0',
        'z-index':'100'
      }">
      <x-header :class="headerType"
        :left-options="{showBack: $route.meta.showBack || false}"
        @on-click-more="showAccountPanel = true">
        <div v-if="!$route.meta.showBack" slot="left">
          <div class="chat-logo">
            <img :src="systemConfig.logo" alt="logo">
          </div>
        </div>
        <div v-if="!$route.meta.showBack" slot="right" class="group">
          <div v-if="user.avatar" class="avatar" :style="{'background-image': `url(${user.avatar})`}"></div>
          <div v-else class="default-avatar"></div>
          <div class="user-name">{{user.nickname}}</div>
          <router-link class="user-info" to="/my">
            <icon scale="1.5" name="user-circle"></icon>
          </router-link>
        </div>
        {{$route.meta.title || $store.state.chatWith.title}}
      </x-header>
      <div class="tab-content" v-if="!$route.meta.tabbarHidden">
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
    </div>
    <router-view></router-view>
    <account-panel
      v-model="showAccountPanel"
      @handleClose="closeAccountPanel" />
  </view-box>
</template>

<script>
import { XHeader, ViewBox, Tab, TabItem, Swiper, SwiperItem, AlertModule } from 'vux'
import { mapGetters, mapState } from 'vuex'
import AccountPanel from './components/AccountPanel'
import { fetchAnnouce } from './api'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/user-circle'
import config from '../config'
const homeLinks = ['/', '/chatroom', '/private', '/results', '/bet']
export default {
  name: 'app',
  components: {
    XHeader,
    ViewBox,
    Tab,
    TabItem,
    Swiper,
    SwiperItem,
    AccountPanel,
    Icon,
    AlertModule
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
      'systemConfig'
    ]),
    unreadCount () {
      const unreadRooms = this.$store.state.unreadRooms
      const usernames = Object.keys(unreadRooms)
      return usernames.filter(username => {
        return !unreadRooms[username]
      }).length
    },
    headerType () {
      if (homeLinks.includes(this.$route.path)) {
        return 'home'
      } else {
        return 'page'
      }
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
      }]
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
        }, 300000)
        ws.onclose = () => {
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
                  let messages = data.latest_message.reverse()
                  let personalSetting = this.$store.state.personal_setting
                  if (personalSetting.reasons.length) {
                    messages.concat([{
                      type: -2
                    }])
                  }
                  this.$store.dispatch('setMessage', messages)
                  return
                } else {
                  switch (data.type) {
                    case 0:
                      this.$store.dispatch('updateReadStatus', {username: data.sender.username, status: false})
                      this.$store.dispatch('setMessage', [data])
                      break
                    case 1:
                      this.$store.dispatch('updateReadStatus', {username: data.sender.username, status: false})
                      this.$store.dispatch('setMessage', [data])
                      break
                    case 2:
                      break
                    case 3:
                      let announcement = this.$store.state.announcement
                      announcement = announcement.push(data.content)
                      this.$store.dispatch('setAnnouncement', announcement)
                      break
                  }
                }
              } else {
                switch (data.error_type) {
                  case 4:
                    this.$store.dispatch('updatePersonalSetting', 'banned')
                    AlertModule.show({
                      content: '您已被聊天室管理员禁言，在' + this.$moment(data.msg).format('YYYY-MM-DD HH:mm:ss') + '后才可以发言。'
                    })
                    break
                  case 5:
                    this.$store.dispatch('setMessage', [])
                    this.$store.dispatch('updatePersonalSetting', 'blocked')
                    AlertModule.show({
                      content: data.msg
                    })
                    break
                  case 6:
                    this.$vux.toast.show({
                      text: data.msg,
                      type: 'warn'
                    })
                    setTimeout(() => {
                      this.$store.dispatch('logout').then(res => {
                        this.$router.push({name: 'Login'})
                      })
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
