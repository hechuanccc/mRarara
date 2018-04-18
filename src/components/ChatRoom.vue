<template>
  <div class="chat-box" id="chatBox" :style="{backgroundImage: `url(${systemConfig.mobileBackground})`}">
    <div class="chat-announce" v-if="announcement.length > 0 && roomId === user.default_room_id">
      <div class="annouce-info clearfix">
        <icon class="volume-up" name="volume-up"></icon>
        公告
      </div>
      <div class="scroll">
        <MarqueeTips :content="announcement[announcementIndex]" :speed="10"></MarqueeTips>
      </div>
    </div>
    <div class="checkin-btn" v-if="systemConfig.checkinSettings.enabled === '1' && roomId === user.default_room_id" @click="showCheckin">
      签到
      <span v-if="!isCheckin" class="badge"></span>
    </div>
    <p class="login-info" v-if="chatLoading">聊天室登录中...</p>
    <div v-else class="chat-container">
      <chat-body :messages="rooms[roomId]" :roomId="roomId" @click.native="hidePanel"/>
      <chat-footer ref="chatFooter" :roomId="roomId" :openEnvelopeDialog="openEnvelopeDialog"/>
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
          'background-image': 'linear-gradient(to top, #fad961, #f76b1c)',
          'background-size': '100% 130px',
          'background-position': 'top',
          'background-repeat': 'no-repeat',
          'background-color': 'transparent'
        }">
          <checkin-dialog :show="isShowCheckinDialog" @closeCheckin="isShowCheckinDialog = false"/>
        </x-dialog>
    </div>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/volume-up'
import { mapState } from 'vuex'
import { buildRoom, sendEnvelope } from '../api'
import { Group, XInput, XTextarea, XButton, Tab, TabItem, AlertModule, Popover, TransferDom, XDialog, Swiper, SwiperItem } from 'vux'
import { msgFormatter } from '../utils'
import { VISITOR } from '../customConfig'
import MarqueeTips from 'vue-marquee-tips'
import ChatBody from './ChatBody'
import ChatFooter from './ChatFooter'
import CheckinDialog from './CheckinDialog'
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
    ChatFooter,
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
      assignRoomId: -1,
      chatWithId: parseInt(this.$route.params.chatWithId),
      isShowEnvelopeDialog: false,
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
      isShowCheckinDialog: false
    }
  },
  computed: {
    ...mapState([
      'user', 'today', 'systemConfig', 'personal_setting', 'announcement', 'rooms'
    ]),
    noPermission () {
      return this.roomId === this.user.default_room_id && (this.personal_setting.banned || this.personal_setting.blocked)
    },
    isCheckin () {
      const lastCheckin = this.user.last_checkin
      return lastCheckin && !this.$moment(this.today).isAfter(lastCheckin, 'day')
    },
    roomId () {
      return this.assignRoomId || this.user.default_room_id || 1
    }
  },
  created () {
    this.chatLoading = false
    this.marqueeInterval = setInterval(() => {
      this.announcementIndex = (this.announcementIndex + 1) % this.announcement.length
    }, 10000)
    if (this.chatWithId) {
      buildRoom([this.user.id, this.chatWithId]).then(data => {
        this.assignRoomId = data.room.id
      }, errRes => {
        AlertModule.show({
          content: msgFormatter(errRes)
        })
        this.$store.dispatch('initChatlist').then(() => {
          this.$router.push('/private')
        })
      })
    } else {
      this.assignRoomId = 0
    }
  },
  methods: {
    showCheckin () {
      if (this.user.viewRole === VISITOR) {
        this.$router.push('/login')
        return
      }
      if (this.personal_setting.blocked) {
        return
      }
      this.isShowCheckinDialog = true
    },
    openEnvelopeDialog () {
      if (this.user.viewRole === VISITOR) {
        this.$router.push('/login')
        return
      }
      if (this.noPermission) {
        return
      }
      this.isShowEnvelopeDialog = true
    },
    submit () {
      if (this.loading) {
        return
      }
      const errors = this.validateAll()
      if (errors.length === 0) {
        this.loading = true
        const envelope = {...this.envelope, sender_id: this.user.id, room_id: this.roomId}
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
    },
    hidePanel () {
      this.$refs.chatFooter.hidePanel()
    }
  },
  beforeDestroy () {
    clearInterval(this.marqueeInterval)
    if (this.roomId !== this.user.default_room_id) {
      let currentMessage = this.rooms[this.roomId]
      if (currentMessage && currentMessage.length > 0) {
        let lastMessage = currentMessage[currentMessage.length - 1]
        this.$store.state.ws.send(JSON.stringify({
          command: 'read_msg',
          message: lastMessage.id,
          room: this.roomId,
          user: this.user.id
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
.checkin-btn {
  position: absolute;
  top: 45px;
  right: 5px;
  box-sizing: border-box;
  width: 86px;
  height: 30px;
  line-height: 30px;
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 #8e6015;
  background-color: #f5a623;
  border: solid 1px #f8b91c;
  color: #fff;
  z-index: 1;
  text-align: center;
  .badge {
    position: absolute;
    top: 3px;
    right: 18px;
    width: 7px;
    height: 7px;
    background-color: red;
    border-radius: 50%;
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
