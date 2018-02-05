<template>
  <div>
    <group label-width="'100px'">
      <cell title="用户名" :value="user.username" ></cell>
      <cell title="修改个人资料" is-link link="/my/profile"></cell>
      <cell title="修改头像" is-link link="/my/image"></cell>
      <cell title="重设密码" is-link link="/my/password"></cell>
    </group>
    <group label-width="'100px'">
      <cell>
        <span class="logout" @click="logoutDialogShow = true" slot="after-title">退出登录</span>
      </cell>
    </group>
    <confirm
      v-model="logoutDialogShow"
      confirm-text="退出登录"
      cancel-text="取消"
      @on-confirm="logout">
      <p class="confirm-text">确定退出登录吗？</p>
    </confirm>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Group, Cell, Confirm } from 'vux'

export default {
  name: 'Home',
  data () {
    return {
      logoutDialogShow: false
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ])
  },
  methods: {
    logout () {
      this.$store.dispatch('logout')
    }
  },
  components: {
    Group,
    Cell,
    Confirm
  }
}
</script>

<style scoped lang="less">
@import '../styles/vars.less';
.weui-cell /deep/ .weui-cell__hd {
  line-height: 1;
}
.vux-x-icon {
  margin-right: 10px;
}
.icon {
  width: 24px;
  margin-right: 10px;
  font-size: 20px;
  display: inline-block;
  vertical-align: middle;
}
.logout {
  display: block;
  text-align: center;
  color: @red;
}
</style>
