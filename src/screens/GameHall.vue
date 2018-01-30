<template>
  <div class="box">
    <tab>
      <tab-item
        :line-width="1"
        @on-item-click="initDeposit"
        :selected="true || view === 'login'">
        快速登录
      </tab-item>
      <!-- <tab-item
        :line-width="1"
        @on-item-click="initRemit"
        :selected="view === 'register'">
        快速注册
      </tab-item> -->
    </tab>
    <transition name="component-fade" mode="out-in">
      <component v-bind:is="view"></component>
    </transition>
    <div @click="showChatRoom = true">点击进入聊天室</div>
    <router-view v-show="!showChatRoom" :key="$route.name + ($route.params.gameId || '')"/>
    <chat-room v-if="showChatRoom"></chat-room>
  </div>
</template>

<script>
  import {Tab, TabItem} from 'vux'
  import login from './login/login'
  import register from './login/register'
  import ChatRoom from '../components/ChatRoom'

  export default {
    data () {
      return {
        view: login,
        showChatRoom: false
      }
    },
    computed: {},
    components: {
      Tab,
      TabItem,
      ChatRoom
    },
    methods: {
      initDeposit () {
        this.view = login
      },
      initRemit () {
        this.view = register
      }
    }
  }
</script>
<style scoped lang="less">

</style>
