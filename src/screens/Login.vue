<template>
  <form class="container" autocomplete="off">
    <group title="欢迎登录">
      <x-input
        required
        show-clear
        ref="username"
        placeholder="请输入用户名"
        @on-change="validate"
        title="用户名"
        label-width="100"
        v-model="user.username">
      </x-input>
      <x-input
        required
        show-clear
        placeholder="请输入密码"
        type="password"
        ref="password"
        autocomplete="off"
        @on-change="validate"
        title="密码"
        label-width="100"
        v-model="user.password">
      </x-input>
    </group>

    <div class="actions">
      <div v-if="error" class="error">{{error}}</div>
      <x-button type="primary"
                action-type ="button"
                :show-loading="loading"
                :disabled="!valid"
                @click.native="submit">登录
      </x-button>
      <flexbox class="m-t">
        <flexbox-item>
          <x-button type="default"
                    action-type ="button"
                    link="/register">
                    注册
          </x-button>
        </flexbox-item>
      </flexbox>
    </div>
  </form>
</template>

<script>
  import { XInput, Group, XButton, Flexbox, FlexboxItem, Popup } from 'vux'

  export default {
    name: 'Home',
    data () {
      return {
        user: {
          username: '',
          password: ''
        },
        valid: false,
        loading: false,
        error: '',
        illegalTriedLogin: false,
        illegalTrial: false
      }
    },
    methods: {
      validate () {
        let valid = true
        for (let x in this.$refs) {
          valid = this.$refs[x].valid && valid
        }
        this.valid = valid
      },
      submit () {
        this.loading = true
        if (this.valid) {
          this.$store.dispatch('login', {
            user: this.user
          }).then(res => {
            this.$store.dispatch('fetchUser')
            this.illegalTriedLogin = false
            this.error = ''
            this.loading = false
            this.$router.push('/')
          }, error => {
            this.loading = false
            this.error = '用户名或密码不正确'
          })
        }
      }
    },
    watch: {
      'error': function (error) {
        if (error) {
          setTimeout(() => {
            this.error = ''
          }, 3000)
        }
      }
    },
    components: {
      XInput,
      Group,
      XButton,
      Flexbox,
      FlexboxItem,
      Popup
    }
  }
</script>

<style lang="less" scoped>
@import '../styles/vars.less';

.container {
  margin-top: 60px;
}
.error {
  color: @red;
  text-align: center;
  margin-bottom: 0.5em;
}
.actions {
  margin-top: 1em;
  padding: 0 1em;
}
.login-button {
  width: 100%;
}
.captcha {
  width: 100px;
  height: 40px;
  vertical-align: middle;
}
.captcha-input {
  height: 30px;
}

.verify-popup {
  width: 95%;
  background-color: white;
  height: 200px;
  margin: 0 auto;
  border-radius: 5px;
  padding-top: 10px;
}
.continue {
  padding: 25px 15px;
}
.trial-error {
  color: @red;
  text-align: center;
  height: 20px;
  line-height: 20px;
  margin-bottom: 5px;
  &.unvisible {
    visibility: hidden;
  }
}
</style>
