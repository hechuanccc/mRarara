<template>
  <div class="chat-box" id="chatBox" :style="{backgroundImage: `url(${systemConfig.mobileBackground})`}">
    <div class="chat-announce" v-if="announcement.length > 0 && roomId === 1">
      <div class="annouce-info clearfix">
        <icon class="volume-up" name="volume-up"></icon>
        公告
      </div>
      <div class="scroll">
        <MarqueeTips :content="announcement[announcementIndex]" :speed="10"></MarqueeTips>
      </div>
    </div>
    <p class="login-info" v-if="chatLoading">聊天室登录中...</p>
    <div v-else class="chat-container">
      <chat-body :messages="rooms[roomId]" :roomId="roomId" @click.native="showSmile = false"/>
      <div class="footer">
        <div class="smile-box" v-if='showSmile'>
          <a href="javascript:void(0)"
            v-for="(item, index) in emojis.people.slice(0, 80)"
            :key="index"
            class="emoji"
            @click="!noPermission ? msgCnt = msgCnt + item.emoji + ' ' : ''">
            {{item.emoji}}
          </a>
        </div>
        <div class="typing">
          <label class="control-bar btn-smile" @click="showSmile = !showSmile">
            <icon scale="1.3" name="smile-o" class="text-center el-icon-picture"></icon>
          </label>
          <label class="control-bar" for="capture" @click="showSmile = false">
            <icon scale="1.3" name="picture-o" class="text-center el-icon-picture"></icon>
            <input @change="sendMsgImg"
              type="file"
              id="capture"
              ref="fileImgSend"
              class="img-upload-input"
              accept="image/*">
          </label>
          <div class="txtinput el-textarea">
            <textarea
              @focus="showSmile = false"
              type="textarea"
              autocomplete="off"
              validateevent="true"
              :class="['el-textarea-inner', !personal_setting.chat ? 'is-disabled' : '']"
              v-model="msgCnt"
              :disabled="noPermission">
            </textarea>
          </div>
          <div class="txt-right clearfix">
            <a href="javascript:void(0)" class="send-btn" @click="sendMsg">发送</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/picture-o'
import 'vue-awesome/icons/volume-up'
import 'vue-awesome/icons/smile-o'
import { mapGetters, mapState } from 'vuex'
import { sendImgToChat, fetchChatEmoji, buildRoom } from '../api'
import { Tab, TabItem, AlertModule, Popover } from 'vux'
import MarqueeTips from 'vue-marquee-tips'
import ChatBody from './ChatBody'
import lrz from 'lrz'

export default {
  components: {
    Tab,
    TabItem,
    AlertModule,
    Icon,
    MarqueeTips,
    Popover,
    ChatBody
  },
  props: {
    routeChanged: {
      default: false
    }
  },
  data () {
    return {
      ws: null,
      announcementIndex: 0,
      showSmile: false,
      msgCnt: '',
      showNickNameBox: false,
      nickname: this.$store.state.user.nickname,
      showImageMsg: false,
      showImageMsgUrl: '',
      emojis: {
        people: []
      },
      showCheckUser: false,
      checkUser: {},
      chatLoading: true,
      routeHasChange: this.routeChanged,
      marqueeInterval: '',
      roomId: '',
      chatWithId: this.$route.params.chatWithId
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ]),
    ...mapState([
      'systemConfig', 'personal_setting', 'announcement', 'rooms', 'chatWith'
    ]),
    noPermission () {
      return this.roomId === 1 && (this.personal_setting.banned || this.personal_setting.blocked)
    }
  },
  created () {
    this.chatLoading = false
    this.marqueeInterval = setInterval(() => {
      this.announcementIndex = (this.announcementIndex + 1) % this.announcement.length
    }, 10000)
    fetchChatEmoji().then((resData) => {
      resData.people = resData.people
      this.emojis = resData
    }).catch(err => {
      console.log(err)
    })
    const chatWithId = this.chatWithId
    if (chatWithId) {
      if (this.chatWith[chatWithId]) {
        this.roomId = this.chatWith[chatWithId]
      } else {
        buildRoom([this.user.id, chatWithId]).then(data => {
          this.roomId = data.room.id
          this.$store.dispatch('setChatWith', ({
            id: chatWithId,
            roomId: data.room.id
          }))
        })
      }
    } else {
      this.roomId = 1
    }
  },
  methods: {
    watchRoomMessages (roomId) {
      this.$watch(function () {
        return this.rooms[roomId]
      }, function (rooms) {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      })
    },
    scrollToBottom () {
      let chatBody = document.getElementById('chatContent')
      if (chatBody && chatBody.scrollHeight > chatBody.clientHeight) {
        chatBody.scrollTop = chatBody.scrollHeight - chatBody.clientHeight
      }
    },
    sendMsgImg (e) {
      let fileInp = this.$refs.fileImgSend
      let file = fileInp.files[0]

      if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(fileInp.value) || this.noPermission) {
        this.$vux.toast.show({
          text: '文件格式不正确或您目前尚不符合发言条件',
          type: 'warn'
        })
        return false
      }

      lrz(file).then(rst => {
        if (rst.fileLen > 1024 * 1024) {
          this.$vux.toast.show({
            text: '图片尺寸太大，请选择较小尺寸的图片',
            type: 'warn'
          })
          return
        }
        let formData = new FormData()
        formData.append('receiver', this.roomId)
        formData.append('image', rst.file)
        sendImgToChat(formData).then((data) => {
          fileInp.value = ''
        })
      })
    },
    sendMsg () {
      this.showSmile = false
      if (!this.msgCnt.trim()) { return false }
      this.$store.state.ws.send(JSON.stringify({
        'command': 'send',
        'receivers': [this.roomId],
        'type': 0,
        'content': this.msgCnt
      }))
      this.msgCnt = ''
    }
  },
  beforeDestroy () {
    clearInterval(this.marqueeInterval)
    if (this.roomId !== 1) {
      let currentMessage = this.rooms[this.roomId]
      if (currentMessage && currentMessage.length > 0) {
        let lastMessage = currentMessage[currentMessage.length - 1]
        this.$store.state.ws.send(JSON.stringify({
          command: 'read_msg',
          message: lastMessage.id,
          chat_with: this.chatWithId,
          room: this.roomId,
          user: this.user.username
        }))
        this.$store.dispatch('updateReadStatus', {id: this.chatWithId, status: true})
      }
    }
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
.chat-container {
  display: flex;
  height: 100%;
  flex-direction: column;
}
.footer {
  display: flex;
  position: relative;
  flex: 0 0 auto;
  width: 100%;
  height: 65px;
  background: #f5f5f5;
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
  .typing {
    display: flex;
    box-sizing: border-box;
    padding: 5px;
    width: 100%;
    height: 100%;
  }
  .el-textarea-inner {
    outline: none;
  }
  .control-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 5px;
    flex: 0.5;
    height: 100%;
    background: #72aadb;
    color: #666;
    text-align: center;
    border-radius: 4px;
    overflow: hidden;
    .img-upload-input {
      display: none;
    }
    .el-icon-picture {
      font-size: 20px;
      color: #fff;
    }
  }
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
</style>
