<template>
<div class="container">
  <div :class="['footer', isFocus?'isFocus':'']">
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
  <div :class="['footer', 'fake', isFocus?'isFocus':'']">
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
            <span v-else>{{series.display_name}}</span>
          </li>
        </ul>
      </div>
    </div>
    <div v-show="isShowControlPanel" class="control-panel">
      <label v-if="systemConfig.envelopeSettings.enabled === '1' && roomId === user.default_room_id" class="control-btn" @click="openEnvelopeDialog">
        <div class="icon-bg">
          <div class="envelope-icon"></div>
        </div>
        <div class="title">发红包</div>
      </label>
      <label class="control-btn" for="capture" @click="checkUploadFile">
        <div class="icon-bg fl">
          <div class="picture-icon"></div>
        </div>
        <div class="title">图片</div>
        <input @change="sendFileMsg($refs.fileImgSend)"
          type="file"
          id="capture"
          ref="fileImgSend"
          class="upload-input"
          accept="image/*">
      </label>
      <label class="control-btn" for="captureVideo" @click="checkUploadFile">
        <div class="icon-bg fl">
          <div class="picture-icon video-icon"></div>
        </div>
        <div class="title">视频</div>
        <input @change="sendFileMsg($refs.fileVideoSend)"
          type="file"
          id="captureVideo"
          ref="fileVideoSend"
          class="upload-input"
          accept="video/*">
      </label>
    </div>
  </div>
</div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'
import _ from 'lodash'
import { VISITOR } from '../customConfig'
import { mapState } from 'vuex'
import 'vue-awesome/icons/smile-o'
import 'vue-awesome/icons/paper-plane'
import { Swiper, SwiperItem } from 'vux'
import { sendFileToChat, fetchStickers } from '../api'
import lrz from 'lrz'

const VIDEO_SIZE = 2

export default {
  name: 'ChatFooter',
  components: {
    Swiper,
    SwiperItem,
    Icon
  },
  props: {
    roomId: {
      type: Number
    },
    openEnvelopeDialog: {
      type: Function
    }
  },
  data () {
    return {
      isFocus: false,
      isShowControlPanel: false,
      isShowEmojiPanel: false,
      msgCnt: '',
      activeSeries: 'symbol'
    }
  },
  created () {
    document.addEventListener('visibilitychange', this.visibilitychange)
  },
  computed: {
    ...mapState([
      'user', 'systemConfig', 'emojis', 'personal_setting'
    ]),
    noPermission () {
      return this.roomId === this.user.default_room_id && (this.personal_setting.banned || this.personal_setting.blocked)
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
    }
  },
  methods: {
    visibilitychange () {
      this.isFocus = false
      if (this.$refs.chatpannel) {
        this.$refs.chatpannel.blur()
      }
    },
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
          if (this.user.viewRole === VISITOR) {
            this.$router.push('/login')
            return
          }
          if (this.noPermission) {
            return
          }
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
    sendFileMsg (fileInp) {
      if (this.user.viewRole === VISITOR) {
        this.$router.push('/login')
        return
      }
      let file = fileInp.files[0]
      let reg = fileInp.id === 'capture' ? /\.(gif|jpg|jpeg|png)$/i : /\.(flv|avi|wmv|mp4|mov)$/i

      if (!reg.test(fileInp.value) || this.noPermission) {
        this.$vux.toast.show({
          text: '文件格式不正确或您目前尚不符合发言条件',
          type: 'warn'
        })
        return false
      }

      let formData = new FormData()
      formData.append('receiver', this.roomId)

      if (fileInp.id === 'capture') {
        lrz(file).then(rst => {
          if (rst.fileLen > 1024 * 1024) {
            this.$vux.toast.show({
              text: '图片尺寸太大，请选择较小尺寸的图片',
              type: 'warn'
            })
            return
          }
          rst.file.name = file.name
          formData.append('media', rst.file)
          sendFileToChat(formData).then((data) => {
            this.hidePanel()
            fileInp.value = ''
          })
        })
      } else {
        if (file.size / 1024 > VIDEO_SIZE * 1024) {
          this.$vux.toast.show({
            text: '视频尺寸太大，请选择较小尺寸的视频',
            type: 'warn'
          })
          return
        }
        formData.append('media', file)
        sendFileToChat(formData).then((data) => {
          this.hidePanel()
          fileInp.value = ''
        })
      }
    },
    sendMsg () {
      if (this.user.viewRole === VISITOR) {
        this.$router.push('/login')
        return
      }
      if (!this.msgCnt.trim()) { return false }
      this.$store.state.ws.send(JSON.stringify({
        'command': 'send',
        'receivers': [this.roomId],
        'type': 0,
        'content': this.msgCnt
      }))
      this.msgCnt = ''
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
    checkUploadFile (e) {
      if (this.user.viewRole === VISITOR) {
        e.preventDefault()
        this.$router.push('/login')
      }
      if (this.noPermission) {
        e.preventDefault()
      }
    }
  },
  beforeDestroy () {
    document.removeEventListener('visibilitychange', this.visibilitychange)
  }
}
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  flex: 0 0 auto;
}
.footer {
  display: flex;
  flex-direction: column;
  position: relative;
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
        .video-icon {
          background: url('../assets/video.png') no-repeat center;
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
      .upload-input {
        display: none;
      }
    }
  }
}
</style>

