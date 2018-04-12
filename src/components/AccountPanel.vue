<template>
  <popup :value="value" position="right" @on-hide="handleClose" class="popup" v-transfer-dom width="180px">
    <group class="head">
      <cell-box
        class="avatar"
        :border-intent="false"
        @click.native="linkTo('/my')">
        <icon scale="4" name="user-circle"></icon>
      </cell-box>
    </group>
    <group class="links" >
      <cell-box
        :border-intent="false"
        @click.native="logoutDialogShow = true">
        <span class="link text-center red" >
          退出登录
        </span>
      </cell-box>
    </group>
    <div v-transfer-dom>
      <confirm
        v-model="logoutDialogShow"
        :confirm-text="'退出登录'"
        :cancel-text="'取消'"
        @on-confirm="logout">
        <p class="confirm-text">{{'确定退出登录吗？'}}</p>
      </confirm>
    </div>
  </popup>
</template>

<script>
  import { TransferDom, Popup, Group, CellBox, Confirm } from 'vux'
  import Icon from 'vue-awesome/components/Icon'
  import 'vue-awesome/icons/user-circle'
  export default {
    props: {
      value: {
        type: Boolean
      }
    },
    data () {
      return {
        logoutDialogShow: false
      }
    },
    directives: {
      TransferDom
    },
    components: {
      Popup,
      Group,
      CellBox,
      Confirm,
      Icon
    },
    methods: {
      logout () {
        this.handleClose()
        this.$store.dispatch('logout')
        this.$router.push('/chatroom')
      },
      handleClose () {
        this.$emit('handleClose')
      },
      linkTo (path) {
        this.handleClose()
        this.$router.push({path: '/my'})
      }
    }
  }
</script>

<style lang="less" scoped>
@import "../styles/vars.less";
.popup {
  background-color: #fff;
}
.head /deep/ .weui-cells{
  margin-top: -1px;
  font-size: 15px;
  text-align: center;
}
.avatar {
  justify-content: center;
}
.weui-cell {
  padding: 10px 20px;
  margin-top: 0;
}
.links {
  position: absolute;
  width: 100%;
  bottom: 0;
  .link {
    display: block;
    width: 100%;
  }
}
</style>
