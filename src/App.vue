<template>
  <view-box
    class='content-box'
    :body-padding-top="$route.meta.tabbarHidden?'40px':'84px'"
    body-padding-bottom="0">
    <div
      slot="header"
      :style="{
        width: '100%',
        position: 'fixed', // lay over the default
        left:'0',
        top:'0',
        'z-index':'100'
      }">
      <x-header :class="headerType"
        :left-options="{showBack: $route.meta.showBack || false}"
        @on-click-more="showAccountPanel = true">
        <div v-if="!$route.meta.showBack" slot="left">
          <div class="chat-logo">
            <img :src="systemConfig.logo" alt="logo">
          </div>
        </div>
        <div v-if="!$route.meta.showBack" slot="right" class="group">
          <div v-if="user.avatar" class="avatar" :style="{'background-image': `url(${user.avatar})`}"></div>
          <div v-else class="default-avatar"></div>
          <div class="user-name">{{user.nickname}}</div>
          <router-link class="user-info" to="/my">
            <icon scale="1.5" name="user-circle"></icon>
          </router-link>
        </div>
        {{$store.state.customTitle || $route.meta.title}}
      </x-header>
      <div class="tab-content" v-if="!$route.meta.tabbarHidden">
        <tab :line-width="2" active-color="#fc378c">
          <tab-item
            class="vux-center"
            :selected="`/${$route.path.split('/')[1]}` === page.path"
            v-for="(page, index) in pages"
            @on-item-click="switchTab(page.path)"
            :key="index">{{page.name}}</tab-item>
        </tab>
      </div>
    </div>
    <router-view></router-view>
    <account-panel
      v-model="showAccountPanel"
      @handleClose="closeAccountPanel" />
  </view-box>
</template>

<script>
import { XHeader, ViewBox, Tab, TabItem, Swiper, SwiperItem } from 'vux'
import { mapGetters, mapState } from 'vuex'
import AccountPanel from './components/AccountPanel'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/user-circle'
const homeLinks = ['/', '/chatroom', '/private', '/results', '/bet']
export default {
  name: 'app',
  components: {
    XHeader,
    ViewBox,
    Tab,
    TabItem,
    Swiper,
    SwiperItem,
    AccountPanel,
    Icon
  },
  data () {
    return {
      pages: [{
        name: '计划聊天室',
        path: '/chatroom'
      },
      // {
      //   name: '客服',
      //   path: '/private'
      // },
      {
        name: '开奖',
        path: '/results'
      }
      // , {
      //   name: '投注',
      //   path: '/bet'
      // }
      ],
      index: 0,
      showAccountPanel: false
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ]),
    ...mapState([
      'systemConfig'
    ]),
    headerType () {
      if (homeLinks.includes(this.$route.path)) {
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
  watch: {
    '$route': function (to, from) {
      if (to.path === '/') {
        this.$router.replace({path: '/chatroom'})
      }
    }
  },
  methods: {
    closeAccountPanel () {
      this.showAccountPanel = false
    },
    switchTab (path) {
      this.$router.push({path})
    }
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
  width: 100%;
  .tab-content {
    .vux-tab {
      z-index: 999;
    }
  }
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
    float: left;
    margin-left: 10px;
    margin-top: 2px;
    img {
      width: 120px;
      height: 30px;
    }
  }
  .default-avatar,.avatar {
    width: 30px;
    height: 30px;
    background-repeat: no-repeat;
    background-size: contain;
  }
  .default-avatar {
    background-image: url('./assets/avatar.png')
  }
  .user-name {
    font-size: 14px;
    padding: 0 10px;
  }
  .user-info {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 100%;
  }
  .logout {
    width: 40px;
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
