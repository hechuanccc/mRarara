<template>
  <div class="chat-body" ref="view" @click="showSmile = false">
    <ul class="lay-scroll">
      <li v-for="(item, index) in messages"
        :key="index"
        :class="['clearfix', 'item', item.sender && user.id === item.sender.id ? 'item-right' : 'item-left', item.type < 0 ? 'sys-msg' : '']">
        <div class="lay-block clearfix" v-if="item.type >= 0">
          <div class="avatar">
            <icon name="cog" class="font-cog" v-if="item.type == 4" scale="3"></icon>
            <img :src="getImgSrc(item.sender)" v-else>
          </div>
          <div class="lay-content">
            <div class="msg-header">
              <h4>{{item.type === 4 ? '计划消息' : item.sender.nickname}}</h4>
              <span class="common-member" v-if="item.type !== 4">
                {{getRole(item.sender.id, item.sender.roles)}}
              </span>
              <span class="msg-time">{{item.created_at | moment('HH:mm:ss')}}</span>
            </div>
            <envelope v-if="item.type === 5" :item="item" @click.native="openEnvelop(item.envelope_status.id)"></envelope>
            <div v-else :class="['bubble', 'bubble' + item.type]">
              <p>
                <span v-if="item.type === 0 || item.type === 4">{{item.content}}</span>
                <img @click="showImageMsg = true; showImageMsgUrl = item.content" v-else-if="item.type === 1" :src="item.content">
              </p>
            </div>
          </div>
        </div>
        <div v-else>
          {{item.content}}
        </div>
      </li>
      <li v-if="roomId===1&&personal_setting.blocked" class="block-user-info">您已被管理员拉黑，请联系客服。<li>
      <li ref="msgEnd" id="msgEnd" class="msgEnd"></li>
    </ul>
    <div v-transfer-dom>
      <popup v-model="showImageMsg" height="100%">
        <div class="close-pop-btn" @click="showImageMsg = false">完成</div>
        <div>
          <img :src="showImageMsgUrl" width="100%">
        </div>
      </popup>
    </div>
    <div v-transfer-dom>
      <x-dialog
        class="envelope-dialog"
        :show.sync="showEnvelopeDialog"
        :hide-on-blur="true"
        :dialog-style="{
          'max-width': '355px',
          width: '355px',
          'box-sizing': 'border-box',
          'padding-top': '15px',
          'background-image': `url('${require('../assets/envelop-top.png')}'), linear-gradient(to right, #de5547, #de5547)`,
          'background-size': 'contain, cover',
          'background-position': 'top, center',
          'background-repeat': 'no-repeat, no-repeat'
        }">
        <div class="close" @click="showEnvelopeDialog = false"></div>
        <div class="envelope-avatar">
          <div v-if="selectedEnvelope.avatar" class="avatar" :style="{'background-image': `url('${host+selectedEnvelope.avatar}')`}"></div>
          <div v-else class="money"></div>
        </div>
        <div class="envelope-owner">{{selectedEnvelope.sendername}} 发红包</div>
        <p class="envelope-content">
          ”{{selectedEnvelope.content}}”
        </p>
        <div v-if="selectedEnvelope.status === 4" class="loader">
          <div class="loading"></div>
          <div class="moneys"></div>
        </div>
        <div v-else-if="selectedEnvelope.status === 2" class="get-amount">
          <div class="row">
            <div class="moneys"></div>
            <div class="amount">{{selectedEnvelope.amount | currency('￥')}}</div>
          </div>
          <div class="text">恭喜你抢到红包啦！</div>
        </div>
        <div v-else class="not-remain">{{selectedEnvelope.status === 3 ?'手慢了，红包已派完。':'红包已过期'}}</div>
        <div v-if="selectedEnvelope.users && selectedEnvelope.users.length" class="userlist">
          <div class="count">{{statistic}}</div>
          <div class="view">
            <ul>
              <li :class="['group', member.receiver_id===user.id?'me':'']" v-for="(member, index) in selectedEnvelope.users" :key="index">
                <span>{{member.nickname}}</span>
                <span>{{member.amount | currency('￥')}}</span>
              </li>
            </ul>
          </div>
        </div>
      </x-dialog>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { TransferDom, Popup, XDialog, XTable } from 'vux'
import { takeEnvelope } from '../api'
import Envelope from './Envelope'
import urls from '../api/urls'
export default {
  components: {
    Popup,
    Envelope,
    XDialog,
    XTable
  },
  directives: {
    TransferDom
  },
  props: {
    messages: {
      default: ''
    },
    roomId: {
      default: ''
    }
  },
  name: 'ChatBody',
  data () {
    return {
      showImageMsg: false,
      showImageMsgUrl: '',
      host: urls.host,
      roleCache: {},
      showEnvelopeDialog: false,
      selectedEnvelope: {},
      messageCount: 0
    }
  },
  computed: {
    ...mapState([
      'user', 'personal_setting', 'rooms', 'envelope'
    ]),
    statistic () {
      if (this.selectedEnvelope.users) {
        const remaining = this.selectedEnvelope.remaining
        const gottenNum = this.selectedEnvelope.users.length
        const total = gottenNum + this.selectedEnvelope.remaining
        if (remaining === 0) {
          return `${gottenNum}/${total} 已领完`
        } else {
          return `${gottenNum}/${total} 已领取`
        }
      } else {
        return ''
      }
    }
  },
  mounted () {
    const view = this.$refs.view
    view.scrollTop = view.scrollHeight
  },
  watch: {
    'messages.length': function (newVal, oldVal) {
      this.$nextTick(() => {
        const view = this.$refs.view
        view.scrollTop = view.scrollHeight
      })
    }
  },
  methods: {
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
    },
    getRole (id, roles) {
      if (this.roleCache[id]) {
        return this.roleCache[id]
      }
      let isManager = ''
      let isService = ''
      for (let i = 0, length = roles.length; i < length; i++) {
        if (roles[i].id === 1) {
          isManager = roles[i].display_name
          break
        } else if (roles[i].id === 4) {
          isService = roles[i].display_name
        }
      }
      if (isManager) {
        this.roleCache[id] = isManager
      } else if (isService) {
        this.roleCache[id] = isService
      } else {
        this.roleCache[id] = '普通会员'
      }
      return this.roleCache[id]
    },
    openEnvelop (id) {
      if (this.envelope[id].status !== 1) {
        this.selectedEnvelope = this.envelope[id]
        this.showEnvelopeDialog = true
        if (this.envelope[id].status === 4) {
          takeEnvelope(id, this.user.id).then(res => {
            const status = res.status
            switch (status) {
              case 'success':
                this.$store.dispatch('updateEnvelope', {id: id, data: {status: 2, amount: res.amount}})
                this.$store.dispatch('fetchUser')
                break
              case 'fail':
                this.$store.dispatch('updateEnvelope', {id: id, data: {status: 3}})
                break
              case 'expired':
                this.$store.dispatch('updateEnvelope', {id: id, data: {status: 1}})
                break
              case 'repeat':
                this.$store.dispatch('updateEnvelope', {id: id, data: {status: 2}})
                break
            }
          })
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.chat-body {
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
  margin-top: 20px;
  padding: 0 5px;
  margin-top: 20px;
  overflow: hidden;
  &.sys-msg {
    text-align: center;
    color: #eee;
    font-size: 12px;
    .type-warning {
      color: #f60;
      .btn-here {
        color: rgb(25, 158, 216);
      }
    }
    div {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 4px;
      background: rgba(255, 255, 255, .2);
    }
  }
  &.item-left {
    .lay-block {
      .lay-content {
        float: left;
        margin-left: 15px;
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
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            padding-top: 2px;
            font-size: 12px;
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
  margin-left: 5px;
  margin-right: 5px;
  float: left;
}
.lay-content {
  width: calc(~"100%" - 62px);
}
.msg-header {
  overflow: hidden;
  h4 {
    float: left;
    max-width: 150px;
    font-size: 14px;
    color: #fff;
    font-weight: 400;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 12px;
    padding-top: 2px;
  }
  .msg-time {
    color: #9f9f9f;
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
.close-pop-btn {
  text-align: right;
  padding: 4px;
  color: #444;
}
.envelope-dialog {
  font-weight: lighter;
  color: #fff;
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
    .money,.avatar {
      height: 60px;
      width: 60px;
      margin: 0 auto;
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center;
      border-radius: 50%;
      box-shadow: 0 2px 1px 0 rgba(149, 8, 8, 0.5);
    }
    .money {
      background-image: url('../assets/money.png')
    }
    .avatar {
      box-sizing: border-box;
      border: 3px solid #debd85;
    }
  }
  .envelope-owner {
    width: 100%;
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    color: #debd85;
  }
  .envelope-content {
    width: 100%;
    box-sizing: border-box;
    word-wrap: break-word;
    line-height: 20px;
    font-size: 14px;
    padding: 0 20px;
  }
  .get-amount {
    width: 100%;
    height: 100px;
    .row {
      display: flex;
      width: 100%;
      height: 60px;
      align-items: center;
      justify-content: center;
      .moneys {
        height: 60px;
        width: 36px;
        background: url('../assets/moneys.png') no-repeat center;
        background-size: contain;
      }
      .amount {
        font-size: 36px;
        height: 60px;
        font-weight: 600;
      }
    }
    .text{
      height: 20px;
      font-size: 14px;
      line-height: 20px;
      width: 100%;
    }
  }
  .not-remain {
    font-size: 20px;
    font-weight: 600;
    width: 100%;
    height: 100px;
    line-height: 100px;
  }
  .userlist {
    box-sizing: border-box;
    width: 100%;
    height: 260px;
    padding:0 35px;
    background: #fff;
    font-size: 14px;
    color: #4a4a4a;
    .count {
      height: 50px;
      line-height: 50px;
      font-size: 12px;
      color: #de5547;
    }
    .view {
      width: 100%;
      height: 210px;
      overflow-y: auto;
      ul {
        width: 100%;
        li {
          height: 20px;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          &.me{
            color: #c0493c;
          }
        }
      }
    }
  }
  .loader {
    position: relative;
    width: 100%;
    height: 100px;
    padding: 20px 0;
    .moneys {
      position: absolute;
      top: 45px;
      height: 50px;
      width: 100%;
      background: url('../assets/moneys.png') no-repeat center;
      background-size: contain;
    }
    .loading {
      font-size: 10px;
      margin: 0 auto;
      text-indent: -9999em;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: #f8e71c;
      background: linear-gradient(to right, #f8e71c 10%, #de5547 42%);
      position: relative;
      animation: load3 1.4s infinite linear;
      transform: translateZ(0);
    }
    .loading:before {
      width: 50%;
      height: 50%;
      background: #f8e71c;
      border-radius: 100% 0 0 0;
      position: absolute;
      top: 0;
      left: 0;
      content: '';
    }
    .loading:after {
      background: #de5547;
      width: 95%;
      height: 95%;
      border-radius: 50%;
      content: '';
      margin: auto;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
    }
    @keyframes load3 {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }
}
</style>
