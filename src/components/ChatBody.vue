<template>
  <div class="chat-body" ref="view" @click="showSmile = false">
    <ul class="lay-scroll">
      <li v-for="(item, index) in messages"
        :key="index"
        :class="['clearfix', 'item', item.sender && user.username === item.sender.username ? 'item-right' : 'item-left', item.type < 0 ? 'sys-msg' : '']">
        <div class="lay-block clearfix" v-if="item.type >= 0">
          <div class="avatar">
            <icon name="cog" class="font-cog" v-if="item.type == 4" scale="3"></icon>
            <img :src="getImgSrc(item.sender)" v-else> </div> <div class="lay-content">
            <div class="msg-header">
              <h4>{{item.type === 4 ? '计划消息' : item.sender.nickname}}</h4>
              <span class="common-member" v-if="item.type !== 4">
                {{getRole(item.sender.id, item.sender.roles)}}
              </span>
              <span class="msg-time">{{item.created_at | moment('HH:mm:ss')}}</span>
            </div>
            <div :class="['bubble', 'bubble' + item.type]">
              <p>
                <span v-if="item.type === 0 || item.type === 4">{{item.content}}</span>
                <img @click="showImageMsg = true; showImageMsgUrl = item.content" v-else-if="item.type === 1" :src="item.content">
              </p>
            </div>
          </div>
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
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { TransferDom, Popup } from 'vux'
import urls from '../api/urls'
export default {
  components: {
    Popup
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
      roleCache: {}
    }
  },
  computed: {
    ...mapState([
      'user', 'personal_setting', 'rooms'
    ])
  },
  mounted () {
    const view = this.$refs.view
    view.scrollTop = view.scrollHeight
  },
  updated () {
    const view = this.$refs.view
    view.scrollTop = view.scrollHeight
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
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
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
  margin-left: 5px;
  margin-right: 5px;
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
</style>
