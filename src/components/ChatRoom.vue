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
      <chat-body :messages="rooms[roomId]" :roomId="roomId" @click.native="hidePanel"/>
      <div class="checkin" v-if="isShowCheckinHint && !isCheckin">
        <div class="bg">
          <div class="btn" @click="isShowCheckinDialog = true">
            <div class="checkin-btn">
              <div class="logo"></div>
              签到</div>
          </div>
          <div class="btn" @click="isShowCheckinHint = false">
            <div class="close-btn"></div>
          </div>
        </div>
      </div>
      <div v-if="user.viewRole !== VISITOR" :class="['footer', isFocus?'isFocus':'']">
        <div id="typing" class="typing" @click="handTriggerPanel">
          <div id="more-btn" class="more-btn"></div>
          <div id="emoji-btn" class="emoji-btn">
            <icon scale="1.5" name="smile-o"></icon>
          </div>
          <textarea
            @focus="isFocus = true"
            @blur="isFocus = false"
            ref="realChatpannel"
            type="textarea"
            autocomplete="off"
            validateevent="true"
            :class="['el-textarea', noPermission ? 'is-disabled' : '']"
            v-model="msgCnt"
            :disabled="noPermission">
          </textarea>
          <div class="send-btn" @click="sendMsg" >
            <icon scale="1" name="paper-plane"></icon>
          </div>
        </div>
      </div>
      <div v-if="user.viewRole !== VISITOR" :class="['footer', 'fake', isFocus?'isFocus':'']">
        <div id="typing" class="typing" @click="handTriggerPanel">
          <div id="more-btn" class="more-btn"></div>
          <div id="emoji-btn" class="emoji-btn">
            <icon scale="1.5" name="smile-o"></icon>
          </div>
          <textarea
            @focus="triggerRealInput"
            ref="chatpannel"
            type="textarea"
            autocomplete="off"
            validateevent="true"
            :class="['el-textarea', noPermission ? 'is-disabled' : '']"
            v-model="msgCnt"
            :disabled="noPermission">
          </textarea>
          <div class="send-btn" @click="sendMsg" >
            <icon scale="1" name="paper-plane"></icon>
          </div>
        </div>
        <div v-show="isShowEmojiPanel" class="emoji-panel">
          <div class="select-panel">
            <swiper
              height="180px"
              dots-position="center"
              dots-class="emoji">
              <swiper-item
                v-for="(chunk, index) in currentEmojisChunk"
                :key="index">
                <ul
                  v-if="activeSeries === 'symbol'" class="symbol-series"
                  @click="sendEmojiSymbol">
                  <li
                    v-for="(emoji, emojiIndex) in chunk"
                    :key="emojiIndex"
                    :data-content="emoji.emoji">
                    {{emoji.emoji}}
                    </li>
                </ul>
                <ul
                  v-else class="sticker-series"
                  @click="sendEmojiSticker">
                  <li
                    v-for="(sticker, stickerIndex) in chunk"
                    :key="stickerIndex"
                    :data-content="sticker.id">
                    <div class="sticker" :style="{'background-image': `url('${sticker.url}')`}"></div>
                    </li>
                </ul>
              </swiper-item>
            </swiper>
          </div>
          <div class="series-panel">
            <ul>
              <li :class="{active: series.name === activeSeries}" v-for="(series, index) in emojiSeries" :key="index" @click="selectSeries(series)">
                <div v-if="series.logo" class="logo" :style="{'background-image':`url('${series.logo}')`}"></div>
                <span v-else :style="{'font-size':'20px'}">{{series.display_name}}</span>
              </li>
            </ul>
          </div>
        </div>
        <div v-show="isShowControlPanel" class="control-panel">
          <label v-if="roomId === 1" class="control-btn" @click="openEnvelopeDialog">
            <div class="icon-bg">
              <div class="envelope-icon"></div>
            </div>
            <div class="title">发红包</div>
          </label>
          <label class="control-btn" for="capture">
            <div class="icon-bg">
              <div class="picture-icon"></div>
            </div>
            <div class="title">图片</div>
            <input @change="sendMsgImg"
              type="file"
              id="capture"
              ref="fileImgSend"
              class="img-upload-input"
              accept="image/*">
          </label>
        </div>
      </div>
    </div>
    <div v-transfer-dom>
      <x-dialog
        class="envelope-dialog"
        :show.sync="isShowEnvelopeDialog"
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
        <div class="close-btn" @click="isShowEnvelopeDialog = false"></div>
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
    <div v-transfer-dom>
        <x-dialog
        :show.sync="isShowCheckinDialog"
        :hide-on-blur="true"
        :dialog-style="{
          'max-width': '355px',
          width: '355px',
          'box-sizing': 'border-box',
          'padding': '0',
          'background-image': `url('${require('../assets/checkin_bg.png')}')`,
          'background-size': 'contain',
          'background-position': 'top',
          'background-repeat': 'no-repeat',
          'background-color': 'transparent'
        }">
          <checkin-dialog :show="isShowCheckinDialog" @closeCheckin="isShowCheckinDialog = false"/>
        </x-dialog>
    </div>
    <div v-if="user.viewRole === VISITOR" class="logout" @click="$store.dispatch('logout')">
      <div class="btn">立即注册/会员登入</div>
    </div>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'
import _ from 'lodash'
import 'vue-awesome/icons/volume-up'
import 'vue-awesome/icons/smile-o'
import 'vue-awesome/icons/paper-plane'
import { mapState } from 'vuex'
import { sendImgToChat, buildRoom, sendEnvelope, fetchStickers } from '../api'
import { Group, XInput, XTextarea, XButton, Tab, TabItem, AlertModule, Popover, TransferDom, XDialog, Swiper, SwiperItem } from 'vux'
import { msgFormatter } from '../utils'
import { VISITOR } from '../customConfig'
import MarqueeTips from 'vue-marquee-tips'
import ChatBody from './ChatBody'
import CheckinDialog from './CheckinDialog'
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
    XButton,
    Swiper,
    SwiperItem,
    CheckinDialog
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
      isShowEnvelopeDialog: false,
      isShowControlPanel: false,
      isShowEmojiPanel: false,
      activeSeries: 'symbol',
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
      },
      VISITOR: VISITOR,
      isShowCheckinDialog: false,
      isShowCheckinHint: true
    }
  },
  computed: {
    ...mapState([
      'user', 'today', 'systemConfig', 'personal_setting', 'announcement', 'rooms', 'emojis'
    ]),
    noPermission () {
      return this.roomId === 1 && (this.personal_setting.banned || this.personal_setting.blocked)
    },
    emojiSeries () {
      let symbol = {
        name: 'symbol',
        display_name: this.emojis.symbol[0] ? this.emojis.symbol[0].emoji : '',
        logo: null
      }
      return [symbol].concat(this.systemConfig.stickerGroups)
    },
    currentEmojisChunk () {
      const emojis = this.emojis[this.activeSeries]
      if (this.activeSeries === 'symbol') {
        return _.chunk(emojis, 24)
      }
      return _.chunk(emojis, 8)
    },
    isCheckin () {
      const lastCheckin = this.user.last_checkin
      return lastCheckin && !this.$moment(this.today).isAfter(lastCheckin, 'day')
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
    triggerRealInput () {
      this.$refs.realChatpannel.focus()
    },
    handTriggerPanel (e) {
      let target = e.target
      let id = target.id
      while (id !== 'typing') {
        if (id === 'more-btn') {
          this.isShowControlPanel = !this.isShowControlPanel
          this.isShowEmojiPanel = false
          break
        } else if (id === 'emoji-btn') {
          this.isShowControlPanel = false
          this.isShowEmojiPanel = !this.isShowEmojiPanel
          break
        }
        target = target.parentNode
        id = target.id
        if (id === 'typing' || target.nodeName === 'BODY') {
          this.hidePanel()
          break
        }
      }
    },
    hidePanel () {
      this.isShowControlPanel = false
      this.isShowEmojiPanel = false
    },
    openEnvelopeDialog () {
      if (this.noPermission) {
        return
      }
      this.isShowEnvelopeDialog = true
    },
    visibilitychange () {
      this.isFocus = false
      if (this.$refs.chatpannel) {
        this.$refs.chatpannel.blur()
      }
    },
    selectSeries (series) {
      let seriesName = series.name
      this.activeSeries = seriesName
      if (seriesName !== 'symbol') {
        if (!this.emojis[seriesName]) {
          fetchStickers(seriesName).then(resp => {
            this.$store.dispatch('initEmoji', {id: seriesName, emojis: resp[seriesName]})
          }).catch(() => {})
        }
      }
    },
    sendEmojiSymbol (e) {
      let target = e.target
      if (target.nodeName === 'LI') {
        this.msgCnt = this.msgCnt + target.dataset.content
      }
    },
    sendEmojiSticker (e, id) {
      let target = e.target
      while (target.nodeName !== 'UL') {
        if (target.nodeName === 'LI') {
          this.$store.state.ws.send(JSON.stringify({
            'command': 'send',
            'receivers': [this.roomId],
            'type': 7,
            'sticker': target.dataset.content
          }))
          this.hidePanel()
          break
        }
        target = target.parentNode
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
          this.hidePanel()
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
          this.hidePanel()
          this.loading = false
          this.isShowEnvelopeDialog = false
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
.checkin {
  position: absolute;
  bottom: 50px;
  height: 60px;
  width: 100%;
  box-sizing: border-box;
  padding: 5px;
  .bg {
    background-image: url('../assets/checkin_icon.png'), linear-gradient(to bottom, #f76b1c 0%, #fad961 100%);
    background-size: 140px, auto;
    background-repeat: no-repeat no-repeat;
    background-position: 20px center, left center;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: flex-end;
    border-radius: 5px;
    .btn {
      height: 100%;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      padding: 0 10px;
    }
    .checkin-btn {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      padding-left: 7px;
      width: 86px;
      height: 25px;
      border-radius: 4px;
      box-shadow: 0 2px 4px 0 #8e6015;
      background-color: #f5a623;
      border: solid 1px #f8b91c;
      color: #fff;
      .logo {
        width: 20px;
        height: 20px;
        background: url('../assets/moneys.png') no-repeat;
        background-size: contain;
        margin-right: 10px;
      }
    }
  }
}
.footer {
  display: flex;
  flex-direction: column;
  position: relative;
  flex: 0 0 auto;
  width: 100%;
  background: #f5f5f5;
  &.fake {
    position: absolute;
    bottom: 0;
  }
  &.isFocus {
    transform: translateY(-36px);
    &.fake {
      display: none
    }
  }
  .typing {
    height: 50px;
    display: flex;
    box-sizing: border-box;
    padding: 5px;
    width: 100%;
    .more-btn {
      flex: 0 0 auto;
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 4px;
      margin-right: 5px;
      background-color: #dfdfdf;
      &::before,&::after {
        position: absolute;
        left: 19px;
        top: 12px;
        content: ' ';
        height: 16px;
        width: 2px;
        background-color: #9b9b9b;
      }
      &::before {
        transform: rotate(90deg);
      }
    }
    .emoji-btn {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 4px;
      margin-right: 5px;
      background-color: #dfdfdf;
      color: #9b9b9b;
    }

    .send-btn {
      flex: 0 0 auto;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 4px;
      width: 40px;
      height: 40px;
      font-size: 14px;
      line-height: 52px;
      background: #4a90e2;
      color: #fff;
    }

    .el-textarea {
      flex: 1 1 auto;
      margin-right: 5px;
      resize: none;
      outline: none;
      display: block;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      font-size: 14px;
      color: #1f2d3d;
      background-color: #fff;
      border: 1px solid #bfcbd9;
      border-radius: 4px;
      transition: border-color .2s cubic-bezier(.645,.045,.355,1);
      box-sizing: border-box;
      background-image: none;
      &.is-disabled {
        border: solid 1px #b9b9b9;
        color: #bbb;
      }
    }
  }
  .emoji-panel {
    width: 100%;
    height: 230px;
    .select-panel {
      width: 100%;
      height: 180px;
      .sticker-series,.symbol-series {
        height: 100%;
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        list-style: none;
        box-sizing: border-box;
        padding: 10px 10px 20px 10px;
        li {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
      .sticker-series{
        li {
          height: 50%;
          width: 25%;
          box-sizing: border-box;
          padding-bottom: 10px;
          .sticker {
            width: 100%;
            height: 100%;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
          }
        }
      }
      .symbol-series{
        li {
          height: 33%;
          width: 12.5%;
          font-size: 20px;
        }
      }
    }
    .series-panel {
      width: 100%;
      height: 50px;
      overflow: hidden;
      ul {
        height: 100%;
        display: flex;
        background: #fff;
        li {
          width: 50px;
          display: flex;
          position: relative;
          align-items: center;
          justify-content: center;
          &.active {
            background: #f5f5f5;
          }
          .logo {
            width: 30px;
            height: 30px;
            background-position: center;
            background-size: contain;
            background-repeat: no-repeat;
          }
        }
      }
    }
  }
  .control-panel {
    display: flex;
    width: 100%;
    height: 90px;
    padding: 5px 0 0 12px;
    box-sizing: border-box;
    .control-btn {
      height: 100%;
      width: 72px;
      padding-right: 12px;
      box-sizing: border-box;
      .icon-bg {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 60px;
        border-radius: 5px;
        background-color: #ffffff;
        border: solid 1px #dfdfdf;
        box-sizing: border-box;
        .envelope-icon {
          background: url('../assets/envelope_btn.png') no-repeat center;
          background-size: contain;
          height: 30px;
          width: 38px;
        }
        .picture-icon {
          background: url('../assets/picture.png') no-repeat center;
          background-size: contain;
          height: 30px;
          width: 38px;
        }
      }
      .title {
        width: 100%;
        height: 30px;
        line-height: 30px;
        text-align: center;
        color: #9b9b9b;
        font-size: 12px;
      }
      .img-upload-input {
        display: none;
      }
    }
  }
}



.envelope-dialog {
  font-weight: lighter;
  .close-btn {
    position: absolute;
    top: 8px;
    right: 8px;
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
.logout {
  position: absolute;
  bottom: 10px;
  height: 40px;
  width: 100%;
  box-sizing: border-box;
  padding: 0 10px;
  .btn {
    width: 100%;
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    font-weight: bold;
    color: #000;
    text-align: center;
    background-image: linear-gradient(-180deg, #FFFFFF 0%, #bfbfbf 100%);
    border-radius: 100px;
  }
}
</style>
