<template>
  <view-box class='content-box'>
    <x-header :class="headerType"
      :left-options="{showBack: $route.meta.showBack || false}"
      :right-options="{showMore: user.logined}"
      @on-click-more="showAccountPanel = true">
      <div v-if="!$route.meta.showBack" slot="left">
        <div class="chat-logo"></div>
      </div>
      <div v-if="!$route.meta.showBack" slot="right" class="group">
        <div class="user-img" :style="avatar"></div>
        <div class="user-name">{{user.nickname}}</div>
        <div class="logout" @click="logout">退出</div>
      </div>
      {{$route.meta.title}}
    </x-header>
    <router-view></router-view>
    <div v-if="!$route.meta.tabbarHidden">
       <tab :line-width="2" active-color="#fc378c" v-model="index">
        <tab-item class="vux-center" :selected="demo2 === item" v-for="(item, index) in list2" @click="demo2 = item" :key="index">{{item}}</tab-item>
      </tab>
      <swiper v-model="index" height="100px" :show-dots="false">
        <swiper-item v-for="(item, index) in list2" :key="index">
          <div class="tab-swiper vux-center">{{item}} Container</div>
        </swiper-item>
      </swiper>
    </div>
    <account-panel
      v-model="showAccountPanel"
      @handleClose="closeAccountPanel" />
  </view-box>
</template>

<script>
import { XHeader, ViewBox, Tab, TabItem, Swiper, SwiperItem } from 'vux'
import { mapGetters } from 'vuex'
import AccountPanel from './components/AccountPanel'
const list = () => ['计划聊天室', '私聊', '开奖', '投注']
export default {
  name: 'app',
  data () {
    return {
      list2: list(),
      demo2: '计划聊天室',
      index: 0,
      showAccountPanel: false
    }
  },
  watch: {
  },
  computed: {
    ...mapGetters([
      'user'
    ]),
    headerType () {
      if (this.$route.path === '/') {
        return 'home'
      } else {
        return 'page'
      }
    },
    avatar () {
      return {
        'background-image': `url(${this.user.avatar})`
      }
    }
  },
  methods: {
    logout () {
      this.$store.dispatch('logout')
      this.$router.push({path: '/login'})
    },
    closeAccountPanel () {
      this.showAccountPanel = false
    }
  },
  created () {
  },
  components: {
    XHeader,
    ViewBox,
    Tab,
    TabItem,
    Swiper,
    SwiperItem,
    AccountPanel
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
  position: fixed;
  top: 0;
  width: 100%;
  left: 0;
  & /deep/ .vux-header{
    height: 40px;
    background-color: #383636;
  }
  & /deep/ .vux-header-left {
  }
  & /deep/ .vux-header-title {
    margin: 0;
  }
  .chat-logo {
    width: 120px;
    height: 30px;
    background: url('./assets/logo.png') no-repeat;
    background-size: contain;
    float: left;
    margin-left: 10px;
    margin-top: 2px;
  }
  .user-img {
    width: 20px;
    height: 20px;
    background-repeat: no-repeat;
    background-size: contain;
  }
  .user-name {
    font-size: 14px;
    padding: 0 10px;
  }
  .logout {
    width: 50px;
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
