<template>
  <div class="chat-box" id="chatBox" :style="{backgroundImage: `url(${systemConfig.mobileBackground})`}">
    <div class="chat-announce" v-if="chatAnnounce.length > 0">
      <div class="annouce-info clearfix">
        <icon class="volume-up" name="volume-up"></icon>
        公告
      </div>
      <div class="scroll">
        <MarqueeTips :content="chatAnnounce[chatAnnounceIndex]" :speed="10"></MarqueeTips>
      </div>
    </div>
    <p class="login-info" v-if="chatLoading">聊天室登录中...</p>
    <div v-else class="chat-body">
      <div class="chat-content" id="chatContent" @click="showSmile = false">
        <ul class="lay-scroll">
          <li v-for="(item, index) in messages" :class="['clearfix', 'item', item.sender && ((item.sender.nickname && item.sender.nickname === user.nickname) || user.username === item.sender.username) ? 'item-right' : 'item-left', item.type < 0 ? 'sys-msg' : '']">
            <div class="lay-block clearfix" v-if="item.type >= 0">
              <div class="avatar">
                <icon name="cog" class="font-cog" v-if="item.type == 4" scale="3"></icon>
                <img :src="getImgSrc(item.sender)" v-else> </div> <div class="lay-content">
                <div class="msg-header">
                  <h4 v-html="item.type === 4 ? '计划消息' : item.sender && item.sender.username === user.username && user.nickname ? user.nickname : item.sender && (item.sender.nickname || item.sender.username)"></h4>
                  <span class="common-member" v-if="item.type !== 4">
                    {{item.sender && item.sender.level_name && item.sender.level_name.indexOf('管理员') !== -1 ? '管理员' : '普通会员'}}
                  </span>
                  <span class="msg-time">{{item.created_at | moment('HH:mm:ss')}}</span>
                </div>
                <div :class="['bubble', 'bubble' + item.type]">
                  <p>
                    <span v-if="item.type === 0 || item.type === 4" v-html="item.content"></span>
                    <img @click="showImageMsg = true; showImageMsgUrl = item.content" v-else-if="item.type === 1" :src="item.content">
                  </p>
                </div>
              </div>
            </div>
            <div v-else-if="item.type === -2 || item.type === -3" class="inner type-warning">
              <p>
                <span v-for="(item, index) in personal_setting.chat.reasons">{{item}}</span>
              </p>
            </div>
          </li>
          <li v-if="personal_setting.blocked" class="block-user-info">您已被管理员拉黑，请联系客服。<li>
          <li ref="msgEnd" id="msgEnd" class="msgEnd"></li>
        </ul>
      </div>
      <div class="footer">
        <div class="smile-box" v-if='showSmile'>
              <a href="javascript:void(0)"
                v-for="(item, index) in emojis.people.slice(0, 80)"
                :key="index"
                class="emoji"
                @click="personal_setting.chat.status ? msgCnt = msgCnt + item.emoji + ' ' : ''">
                {{item.emoji}}
              </a>
            </div>
        <div class="typing">
          <div class="control-bar">
            <a href="javascript:void(0)" class="btn-control btn-smile">
              <label @click="showSmile = !showSmile">
                <icon scale="1.3" name="smile-o" class="text-center el-icon-picture"></icon>
              </label>
            </a>
          </div>
          <div class="control-bar">
            <a href="javascript:void(0)" class="btn-control">
              <label for="imgUploadInput" @click="showSmile = false">
                <icon scale="1.3" name="picture-o" class="text-center el-icon-picture"></icon>
                <input @change="sendMsgImg"
                  type="file"
                  capture="camera"
                  ref="fileImgSend"
                  class="img-upload-input"
                  id="imgUploadInput"
                  accept=".jpg, .png, .gif, .jpeg, image/jpeg, image/png, image/gif">
              </label>
            </a>
          </div>
          <div class="txtinput el-textarea">
            <textarea
              @focus="showSmile = false"
              type="textarea"
              autocomplete="off"
              validateevent="true"
              :class="['el-textarea-inner', !personal_setting.chat ? 'is-disabled' : '']"
              v-model="msgCnt"
              :disabled="personal_setting.chat.status ? false : true">
            </textarea>
          </div>
          <div class="txt-right clearfix">
            <a href="javascript:void(0)" class="send-btn" @click="sendMsg">发送</a>
          </div>
        </div>
      </div>
      <div v-transfer-dom>
        <popup v-model="showImageMsg" height="100%">
          <div class="close-pop-btn" @click="showImageMsg = false">完成</div>
          <div>
            <img :src="showImageMsgUrl" width="100%">
          </div>
        </popup>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/picture-o'
import 'vue-awesome/icons/volume-up'
import 'vue-awesome/icons/smile-o'
import { mapGetters, mapState } from 'vuex'
import { sendImgToChat, fetchAnnouce, fetchChatEmoji } from '../api'
import { TransferDom, Tab, TabItem, AlertModule, Popup, Popover } from 'vux'
import MarqueeTips from 'vue-marquee-tips'
import config from '../../config'
import urls from '../api/urls'
const WSHOST = config.chatHost

export default {
  components: {
    Popup,
    Tab,
    TabItem,
    AlertModule,
    Icon,
    MarqueeTips,
    Popover
  },
  directives: {
    TransferDom
  },
  props: {
    routeChanged: {
      default: false
    }
  },
  data () {
    return {
      ws: null,
      chatAnnounce: [],
      chatAnnounceIndex: 0,
      messages: [],
      showSmile: false,
      msgCnt: '',
      showNickNameBox: false,
      nickname: this.$store.state.user.nickname,
      showImageMsg: false,
      showImageMsgUrl: '',
      announcement: '',
      emojis: {
        people: []
      },
      personal_setting: {
        chat: {
          reasons: [],
          status: ''
        },
        manager: true
      },
      showCheckUser: false,
      checkUser: {},
      chatLoading: true,
      routeHasChange: this.routeChanged,
      RECEIVER: parseInt(this.$route.params.receiver) || 1,
      host: urls.host,
      hearbeat: '',
      marqueeInterval: ''
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ]),
    ...mapState([
      'systemConfig'
    ]),
    resultsHeight () {
      return (document.documentElement.clientHeight || document.body.clientHeight) - 40 - 44
    }
  },
  created () {
    this.joinChatRoom()
    this.getAnnouce()
  },
  methods: {
    leaveRoom () {
      if (this.$route.name === 'GameDetail') { return }
      this.messages = []
      this.ws && this.ws.send(JSON.stringify({
        'command': 'leave',
        'receivers': [this.RECEIVER]
      }))
      if (this.ws) {
        this.ws.close()
      }
    },
    joinChatRoom () {
      let token = Vue.cookie.get('access_token')
      if ((this.ws && this.ws.readyState === 1 && this.messages.length)) {
        return false
      }
      if (!token) {
        this.$store.commit('CLEAR_MEMBER')
        return this.$router.push('/login?next=' + this.$route.path)
      }
      this.chatLoading = true
      this.ws = new WebSocket(`${WSHOST}/chat/stream?token=${token}`)
      this.ws.onopen = () => {
        if (!this.emojis.people.length) {
          fetchChatEmoji().then((resData) => {
            resData.people = resData.people.reverse()
            this.emojis = resData
          }).catch(err => {
            console.log(err)
          })
        }
        this.handleMsg()
        this.hearbeat = setInterval(() => {
          this.ws.send(JSON.stringify({
            'command': 'live',
            'user_id': this.user.id
          }))
        }, 300000)
      }
      this.ws.onclose = () => {
        this.ws = null
      }
      setTimeout(() => {
        if (!this.ws || (this.ws && this.ws.readyState !== 1)) {
          this.joinChatRoom()
        }
      }, 2000)
    },
    handleMsg () {
      this.chatLoading = false
      if (this.RECEIVER === 1) { // 進入遊戲大廳
        this.ws.send(JSON.stringify({
          'command': 'join',
          'receivers': [this.RECEIVER]
        }))
      } else { // 私聊
        this.personal_setting.chat.status = 1
      }
      this.ws.onmessage = (resData) => {
        let data
        if (typeof resData.data === 'string') {
          try {
            data = JSON.parse(resData.data)
            if (data.personal_setting) {
              this.personal_setting = data.personal_setting
            } else if (!data.error_type) {
              // 只顯示目前房間的歷史訊息
              if (data.latest_message && data.latest_message.length > 0 && data.latest_message[1].receivers === this.RECEIVER) {
                this.messages = this.messages.concat(data.latest_message.reverse())
                if (this.personal_setting.chat.reasons.length) {
                  this.messages = this.messages.concat([{
                    type: -2
                  }])
                }
                this.$nextTick(() => {
                  this.$refs.msgEnd && this.$refs.msgEnd.scrollIntoView()
                })
                return
              } else {
                switch (data.type) {
                  case 2:
                    if (data.command === 'unblock') {
                      this.personal_setting.blocked = false
                      this.joinChatRoom()
                      AlertModule.show({
                        content: data.content
                      })
                    } else if (data.command === 'unbanned') {
                      this.personal_setting.chat.status = 1
                      AlertModule.show({
                        content: data.content
                      })
                    }
                    break
                  case 3:
                    this.announcement = data.content
                    break
                  default:
                    if (data.receivers === this.RECEIVER) {
                      this.messages.push(data)
                    }
                }

                let chatBody = document.getElementById('chatContent')
                this.$nextTick(() => { // 有新訊息則下拉至底部
                  if (chatBody.scrollHeight > chatBody.clientHeight) {
                    chatBody.scrollTop = chatBody.scrollHeight - chatBody.clientHeight
                  }
                })
              }
            } else {
              switch (data.error_type) {
                case 4:
                  AlertModule.show({
                    content: '您已被聊天室管理员禁言，在' + this.$moment(data.msg).format('YYYY-MM-DD HH:mm:ss') + '后才可以发言。'
                  })
                  this.personal_setting.banned = true
                  this.personal_setting.chat.status = 0
                  break
                case 5:
                  this.messages = []
                  this.personal_setting.blocked = true
                  this.personal_setting.chat.status = 0
                  AlertModule.show({
                    content: data.msg
                  })
                  break
                case 6:
                  this.errMsgCnt = data.msg
                  setTimeout(() => {
                    this.errMsgCnt = ''
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
      setTimeout(() => {
        this.$refs.msgEnd && this.$refs.msgEnd.scrollIntoView()
      }, 1000)
    },
    getAnnouce () {
      fetchAnnouce().then(result => {
        result.forEach((item) => {
          if (item.platform !== 0) {
            this.chatAnnounce.push(item.content)
          }
        })
        this.marqueeInterval = setInterval(() => {
          this.chatAnnounceIndex = (this.chatAnnounceIndex + 1) % this.chatAnnounce.length
        }, 10000)
      })
    },
    sendMsgImg (e) {
      let fileInp = this.$refs.fileImgSend
      let file = fileInp.files[0]
      if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(fileInp.value) || !this.personal_setting.chat.status) {
        this.errMsgCnt = '文件格式不正确或您目前尚不符合发言条件'
        this.errMsg = true
        return false
      }
      if (file.size > 1024 * 1024) {
        this.errMsg = true
        this.errMsgCnt = '图片尺寸太大，请选择较小尺寸的图片。'
        return
      }
      let formData = new FormData()
      formData.append('receiver', this.RECEIVER)
      formData.append('image', file)
      sendImgToChat(formData).then((data) => {
        fileInp.value = ''
      })
    },
    sendMsg () {
      this.showSmile = false
      if (!this.msgCnt.trim()) { return false }
      this.ws.send(JSON.stringify({
        'command': 'send',
        'receivers': [this.RECEIVER],
        'type': 0,
        'content': this.msgCnt
      }))
      this.msgCnt = ''
    },
    getImgSrc (sender) {
      if (sender) {
        if (sender.id === this.user.id) {
          if (this.user.avatar) {
            return this.user.avatar
          }
        } else if (sender.avatar) {
          return this.host + sender.avatar
        }
      }
      return require('../assets/avatar.png')
    }
  },
  beforeDestroy () {
    this.$store.dispatch('setCustomTitle', '')
    clearInterval(this.hearbeat)
    clearInterval(this.marqueeInterval)
    this.leaveRoom()
  }
}
</script>

<style lang="less" scoped>
@import '../styles/vars.less';

.chat-box {
  position: relative;
  width: 100%;
  height: 100%;
  background: no-repeat right bottom;
  background-attachment: fixed;
  background-size: cover;
  .login-info {
    color: red;
    border-top-color: rgb(204, 204, 204);
    display: inline;
    padding: 2px 10px;
    border-radius: 3px;
    font-size: 14px;
    margin: 60px auto;
  }
}
.chat-announce {
  position: absolute;
  top: 5px;
  margin: 0 5px;
  width: calc(~"100%" - 12px);
  background: rgba(237,244,254,.9);
  border: 1px solid #c2cfe2;
  border-radius: 5px;
  height: 29px;
  overflow: hidden;
  z-index: 1;
  .annouce-info {
    display: flex;
    align-items: center;
    float: left;
    background: #e1edfd;
    color: @red;
    padding: 0 8px;
    line-height: 29px;
    font-size: 14px;
    .volume-up {
      margin-right: 4px;
    }
  }
  .scroll {
    line-height: 30px;
    font-size: 14px;
    display: block;
    margin-left: 72px;
  }
}
.chat-body {
  display: flex;
  height: 100%;
  flex-direction: column;
}
.chat-content {
  flex: 1 1 auto;
  height: 100%;
  overflow-y: auto;
}
.lay-scroll {
  .block-user-info {
    text-align: center;
    padding-top: 100px;
    font-size: 16px;
    color: red;
  }
}
.item {
  padding: 0 5px;
  overflow: hidden;
  &.sys-msg {
    text-align: center;
    margin: 5px 0;
    .inner {
      color: #999;
      display: inline-block;
      background: #efefef;
      border-radius: 8px;
      border: 1px solid #dddddc;
      padding: 5px 10px;
      font-size: 13px;
    }
    .type-warning {
      color: #f60;
      .btn-here {
        color: rgb(25, 158, 216);
      }
    }
  }
  &.item-left {
    .lay-block {
      .lay-content {
        .bubble:after {
          left: 0;
          border-left: 0;
          margin-left: -8px;
          border-right-color: inherit;
        }
      }
    }
  }
  &.item-right {
    .lay-block {
      .avatar {
        float: right;
      }
      .lay-content {
        float: right;
        margin-right: 15px;
        .msg-header {
          h4 {
            text-align: right;
            float: right;
            padding-top: 2px;
            font-size: 14px;
          }

          span {
            float: right;
          }
        }
        .bubble {
          float: right;
        }
        .bubble:after {
          right: 0;
          border-right: 0;
          margin-right: -9px;
          border-left-color: inherit;
        }
      }
    }
  }
}
.lay-block {
  .avatar {
    width: 42px;
    height: 42px;
    float: left;
    .font-cog {
      color: #7285d6;
    }
    img {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 7px;
    }
  }
}
.common-member {
  margin: 0 2px;
  background: #cb9b64;
  color: #fff;
  padding: 0 6px;
  border-radius: 10px;
  font-weight: 400;
  font-size: 10px;
  float: left;
}
.lay-content {
  margin-left: 18px;
  float: left;
  max-width: 75%;
}
.msg-header {
  overflow: hidden;
  h4 {
    font-size: 14px;
    color: #4f77ab;
    display: inline-block;
    font-weight: 400;
    max-width: 73px;
    text-overflow:ellipsis;
    line-height: 12px;
    float: left;
    padding-top: 2px;
  }
  .msg-time {
    color: #9f9f9f;
    margin-left: 10px;
    float: left;
    font-size: 12px;
  }
}
.bubble {
  background: linear-gradient(to right, #1976D2, rgb(25, 158, 216));
  border-left-color: rgb(25, 158, 216);
  border-right-color: #1976D2;
  color: rgb(255, 255, 255);
  margin-top: 3px;
  position: relative;
  border-radius: 5px;
  padding: 5px 8px;
  font-size: 13px;
  display: inline-block;
  p {
    width: 100%;
  }
  &.bubble1 {
    width: 55%;
  }
  &.bubble4 {
    background: #ab47bc;
    background: linear-gradient(to right,#ab47bc,#5169DE);
    border-left-color: #5169de;
    border-right-color: #ab47bc;
  }
  p {
    display: inline-block;
    span {
      white-space: pre-wrap;
      word-break: break-all;
      font-size: 14px;
    }
    img {
      width: 100%;
      min-height: 50px;
    }
  }
}
.bubble:after {
  content: '';
  position: absolute;
  top: 14px;
  width: 0;
  height: 0;
  border: 9px solid transparent;
  border-top: 0;
  margin-top: -7px;
}
.footer {
  flex: 0 0 auto;
  width: 100%;
  height: 65px;
  background: #f5f5f5;
  padding: 0;
  .smile-box {
    position: absolute;
    width: 100%;
    height: 136px;
    background-color: #ffffff;
    overflow: scroll;
    bottom: 65px;
    .emoji {
      padding: 2px 6px 0 6px;
      display: inline-block;
      cursor: pointer;
      position: relative;
      font-size: 18px;
      text-align: center;
      border: 2px solid transparent;
    }
  }
}
.typing {
  .el-textarea-inner {
    outline: none;
  }
  .control-bar {
    margin-right: 5px;
    flex: 0.5;
    height: 100%;
    background: #72aadb;
    border-radius: 4px;
    overflow: hidden;
    .img-upload-input {
      width: 0.1px;
      height: 0.1px;
      opacity: 0;
      position: absolute;
      top: -20px;
    }
  }
  display: flex;
  position: relative;
  padding: 5px;
  .txtinput {
    flex: 3;
  }
  .txt-right {
    margin-left: 5px;
    flex: 1;
  }
  .el-textarea {
    vertical-align: bottom;
  }
  .is-disabled {
    .el-textarea-inner {
      background-color: #eef1f6;
      border-color: #d1dbe5;
      color: #bbb;
      cursor: not-allowed;
      height: 54px;
      resize: none;
    }
  }
  .el-textarea-inner {
    display: block;
    resize: vertical;
    padding: 5px 7px;
    line-height: 1.5;
    width: 100%;
    font-size: 14px;
    color: #1f2d3d;
    background-color: #fff;
    border: 1px solid #bfcbd9;
    border-radius: 4px;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    box-sizing: border-box;
    background-image: none;
  }
}

.btn-control {
  height: 100%;
  display: block;
  line-height: 54px;
  color: #666;
  text-align: center;
  .el-icon-picture {
    font-size: 20px;
    color: #fff;
  }
}

.send-btn {
  display: block;
  text-align: center;
  border-radius: 3px;
  height: 100%;
  font-size: 14px;
  line-height: 52px;
  background: #72aadb;
  color: #fff;
}
.close-pop-btn {
  text-align: right;
  padding: 4px;
  color: #444;
}
</style>
