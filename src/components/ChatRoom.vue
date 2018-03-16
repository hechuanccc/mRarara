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
      <chat-body :messages="rooms[roomId]" :roomId="roomId"/>
      <div :class="['footer', isFocus?'isFocus':'']">
        <div class="typing">
          <label class="control-bar" for="capture">
            <icon scale="1.3" name="picture-o" class="text-center el-icon-picture"></icon>
            <input @change="sendMsgImg"
              type="file"
              id="capture"
              ref="fileImgSend"
              class="img-upload-input"
              accept="image/*">
          </label>
          <label v-if="roomId === 1" class="control-bar" @click="openEnvelopeDialog">
            <div class="envelope-icon"></div>
          </label>
          <div class="txtinput el-textarea">
            <textarea
              @focus="isFocus = true"
              @blur="isFocus = false"
              ref="chatpannel"
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
    <div v-transfer-dom>
      <x-dialog
        class="envelope-dialog"
        :show.sync="showEnvelopeDialog"
        :hide-on-blur="true"
        @on-hide="reset"
        :dialog-style="{
          'max-width': '355px',
          width: '355px',
          'box-sizing': 'border-box',
          'padding': '15px 10px 10px 10px',
          'background-image': `url('${require('../assets/envelop-top.png')}'), linear-gradient(to right, #de5547, #de5547)`,
          'background-size': 'contain, cover',
          'background-position': 'top, center',
          'background-repeat': 'no-repeat, no-repeat'
        }">
        <div class="close" @click="showEnvelopeDialog = false"></div>
        <div class="envelope-avatar">
          <div class="money"></div>
        </div>
        <div class="text-field">
          拼手气红包
        </div>
        <div class="balance-field">
          <span>我的余额</span>
          <span class="balance">{{user.balance | currency('￥')}}</span>
        </div>
        <group label-width="120px" label-align="left" label-margin-right="10px">
          <x-input
            autocapitalize="off"
            title="红包金额"
            placeholder="请输入红包金额"
            placeholder-align="right"
            type="number"
            v-model.number="envelope.pack_amount"
            @on-blur="validate($event, 'pack_amount')"
            @on-change="validate($event, 'pack_amount')"
            keyboard="number">
          </x-input>
          <div class="input-validate">
            最高金额 {{systemConfig.envelopeSettings.max_amount | currency('￥')}}
            &nbsp;
            最低金额 {{systemConfig.envelopeSettings.min_amount | currency('￥')}}
          </div>
          <x-input
            autocapitalize="off"
            title="红包个数"
            placeholder="请输入红包个数"
            placeholder-align="right"
            type="number"
            v-model.number="envelope.pack_nums"
            @on-blur="validate($event, 'pack_nums')"
            @on-change="validate($event, 'pack_nums')"
            keyboard="number">
          </x-input>
          <div class="input-validate">
            最多个数 {{systemConfig.envelopeSettings.per_max_count}}
          </div>
          <x-textarea
            title=""
            placeholder="恭喜发财，大吉大利"
            :height="50"
            :max="20"
            v-model="envelope.content"></x-textarea>
        </group>
        <div class="footer">
          <div class="error">{{error}}</div>
          <x-button
            type="primary"
            action-type ="button"
            :show-loading="loading"
            :disabled="false"
            @click.native="submit">确认发出
          </x-button>
        </div>
      </x-dialog>
    </div>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/picture-o'
import 'vue-awesome/icons/volume-up'
import 'vue-awesome/icons/smile-o'
import { mapGetters, mapState } from 'vuex'
import { sendImgToChat, buildRoom, sendEnvelope } from '../api'
import { Group, XInput, XTextarea, XButton, Tab, TabItem, AlertModule, Popover, TransferDom, XDialog } from 'vux'
import { msgFormatter } from '../utils'
import MarqueeTips from 'vue-marquee-tips'
import ChatBody from './ChatBody'
import lrz from 'lrz'
const validateItems = ['pack_amount', 'pack_nums']
export default {
  components: {
    Tab,
    TabItem,
    AlertModule,
    Icon,
    MarqueeTips,
    Popover,
    ChatBody,
    XDialog,
    Group,
    XInput,
    XTextarea,
    XButton
  },
  directives: {
    TransferDom
  },
  data () {
    return {
      ws: null,
      announcementIndex: 0,
      msgCnt: '',
      showNickNameBox: false,
      nickname: this.$store.state.user.nickname,
      showImageMsg: false,
      showImageMsgUrl: '',
      showCheckUser: false,
      checkUser: {},
      chatLoading: true,
      marqueeInterval: '',
      roomId: '',
      chatWithId: this.$route.params.chatWithId,
      isFocus: false,
      showEnvelopeDialog: false,
      envelope: {
        pack_amount: '',
        pack_nums: '',
        content: ''
      },
      loading: false,
      error: '',
      validators: {
        'pack_amount': {
          error: '',
          validate: (value) => {
            if (!value) {
              return '请输入金额'
            } else if (value < this.systemConfig.envelopeSettings.min_amount) {
              return '须高于最低金额限制'
            } else if (value > this.systemConfig.envelopeSettings.max_amount) {
              return '不能超过最高金额限制'
            } else {
              return ''
            }
          }
        },
        'pack_nums': {
          error: '',
          validate: (value) => {
            if (!value) {
              return '请输入个数'
            } else if (value > this.systemConfig.envelopeSettings.per_max_count) {
              return '红包数量超出限制'
            } else {
              return ''
            }
          }
        }
      }
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ]),
    ...mapState([
      'systemConfig', 'personal_setting', 'announcement', 'rooms'
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
    const chatWithId = this.chatWithId
    if (chatWithId) {
      buildRoom([this.user.id, chatWithId]).then(data => {
        this.roomId = data.room.id
      }, errRes => {
        AlertModule.show({
          content: msgFormatter(errRes)
        })
        this.$store.dispatch('initChatlist').then(() => {
          this.$router.push('/private')
        })
      })
    } else {
      this.roomId = 1
    }
    document.addEventListener('visibilitychange', this.visibilitychange)
  },
  methods: {
    openEnvelopeDialog () {
      if (this.noPermission) {
        return
      }
      this.showEnvelopeDialog = true
    },
    visibilitychange () {
      this.isFocus = false
      if (this.$refs.chatpannel) {
        this.$refs.chatpannel.blur()
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
      if (!this.msgCnt.trim()) { return false }
      this.$store.state.ws.send(JSON.stringify({
        'command': 'send',
        'receivers': [this.roomId],
        'type': 0,
        'content': this.msgCnt
      }))
      this.msgCnt = ''
    },
    submit () {
      if (this.loading) {
        return
      }
      const errors = this.validateAll()
      if (errors.length === 0) {
        this.loading = true
        const envelope = {...this.envelope, sender_id: this.user.id}
        if (!envelope.content) {
          envelope.content = '恭喜发财，大吉大利'
        }
        sendEnvelope(envelope).then(data => {
          this.loading = false
          this.showEnvelopeDialog = false
          this.$store.dispatch('fetchUser')
        }, error => {
          this.error = msgFormatter(error)
          this.loading = false
        })
      } else {
        this.error = errors[0]
      }
    },
    reset () {
      this.envelope = {}
      this.error = ''
    },
    validate (value, input) {
      this.error = this.validators[input].validate(value)
    },
    validateAll () {
      return validateItems
      .map(item => this.validators[item].validate(this.envelope[item]))
      .filter(msg => msg)
    }
  },
  beforeDestroy () {
    document.removeEventListener('visibilitychange', this.visibilitychange)
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
@import '~vux/src/styles/close';

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
  &.isFocus {
    transform: translateY(-28px);
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
    border: 1px solid #bfcbd9;
    background: #efefef;
    color: #666;
    text-align: center;
    border-radius: 4px;
    overflow: hidden;
    .img-upload-input {
      display: none;
    }
    .el-icon-picture {
      font-size: 20px;
      color: #72aadb;
    }
  }
  .envelope-icon {
    background: url('../assets/envelope_btn.png') no-repeat center;
    background-size: contain;
    height: 30px;
    width: 38px;
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

.envelope-dialog {
  font-weight: lighter;
  .close {
    position: absolute;
      right: 8px;
      top: 8px;
      width: 30px;
      height: 30px;
    &::before, &::after {
      position: absolute;
      content: ' ';
      top: 5px;
      right: 15px;
      height: 20px;
      width: 2px;
      background-color: #fff;
    }
    &::before {
      transform: rotate(45deg);
    }

    &::after {
      transform: rotate(-45deg);
    }
  }

  .envelope-avatar {
    height: 60px;
    width: 100%;
    .money {
      height: 60px;
      width: 60px;
      margin: 0 auto;
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center;
      border-radius: 50%;
      box-shadow: 0 2px 1px 0 rgba(149, 8, 8, 0.5);
      background-image: url('../assets/money.png')
    }
  }
  .text-field {
    width: 100%;
    margin-top: 10px;
    font-size: 14px;
    color: #ffffff;
  }
  .balance-field {
    width: 100%;
    margin-top: 10px;
    font-size: 12px;
    color: #ffffff;
    .balance {
      margin-left: 10px;
    }
  }
  .input-validate{
    text-align: left;
    height: 40px;
    line-height: 40px;
    background: #de5547;
    color: rgba(255, 255, 255, .8);
    font-size: 12px;
  }

  & /deep/ .weui-cells.vux-no-group-title::after {
    border: none;
  }

  .footer {
    width: 235px;
    height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    box-sizing: border-box;
    background: transparent;
    margin: 0 auto;
    & /deep/ .weui-btn.weui-btn_primary {
      color: #4a4a4a;
      background: #f5b723;
    }
    & /deep/ .weui-btn_disabled.weui-btn_primary {
      color: #a4a4a4;
      background: #fadb91;
    }
    .error {
      width: 100%;
      height: 30px;
      line-height: 30px;
      color: #fff;
      text-align: center;
    }
  }
}
</style>
