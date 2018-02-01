<template>
  <view-box class='content-box'>
    <x-header :left-options="{showBack: false}">
      <div class="chat-logo"></div>
      <div class="logout">退出</div>
      <div class="user-name">山东桃酥</div>
      <div class="user-img"></div>
    </x-header>
    <router-view></router-view>
    <div>
       <tab :line-width=2 active-color='#fc378c' v-model="index">
        <tab-item class="vux-center" :selected="demo2 === item" v-for="(item, index) in list2" @click="demo2 = item" :key="index">{{item}}</tab-item>
      </tab>
      <swiper v-model="index" height="100px" :show-dots="false">
        <swiper-item v-for="(item, index) in list2" :key="index">
          <div class="tab-swiper vux-center">{{item}} Container</div>
        </swiper-item>
      </swiper>
    </div>
  </view-box>
</template>

<script>
import { XHeader, ViewBox, Tab, TabItem, Swiper, SwiperItem } from 'vux'
const list = () => ['计划聊天室', '私聊', '开奖', '投注']
export default {
  name: 'app',
  data () {
    return {
      list2: list(),
      demo2: '计划聊天室',
      index: 0
    }
  },
  watch: {
  },
  computed: {
  },
  methods: {
  },
  created () {
  },
  components: {
    XHeader,
    ViewBox,
    Tab,
    TabItem,
    Swiper,
    SwiperItem
  }
}
</script>

<style lang="less" scoped>
body {
  margin: 0px auto;
  padding: 0px;
}
.content-box {
  position: fixed;
  top: 0;
  width: 100%;
  & /deep/ .vux-header{
    height: 40px;
    background-color: #383636;
  }
  & /deep/ .vux-header-left {
    display: none;
  }
  & /deep/ .vux-header-title {
    margin: 0;
  }
  & /deep/ .vux-header-right {
    display: none;
  }
  .chat-logo {
    width: 120px;
    height: 30px;
    background-color: #FFFFFF;
    float: left;
    margin-left: 10px;
    margin-top: 2px;
  }
  .user-img {
    width: 20px;
    height: 20px;
    float: right;
    margin-top: 10px;
    margin-right: 4px;
    background: #FFFFFF;
  }
  .user-name {
    margin-right: 5px;
    float: right;
    font-size: 14px;
    width: 70px;
    overflow: hidden;
    text-align: left;
    font-weight: 200;
  } 
  .logout {
    color: #FFFFFF;
    float: right;
    font-size: 14px;
    font-weight: 200;
    letter-spacing: 2px;
    margin-right: 6px;
    width: 28px;
  }
}
</style>