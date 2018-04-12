<template>
  <div>
    <form class="container" autocomplete="off">
      <group>
        <div v-if="showInputErrors.length">
          <ul slot="after-title" class="input-errors">
            <li class="text" v-for="(error, index) in showInputErrors" :key="index">
              {{error}}
            </li>
          </ul>
        </div>
        <x-input
          :class="{'weui-cell_warn': inputErrors['username']}"
          show-clear
          @on-change="validate($event, 'username')"
          @on-blur="validate($event, 'username')"
          ref="username"
          placeholder="6~15位英数字"
          title="用户名"
          label-width="100"
          :debounce="1000"
          v-model="user.username">
        </x-input>
        <x-input
          :class="{'weui-cell_warn': inputErrors['password']}"
          show-clear
          type="password"
          @on-change="validate($event, 'password')"
          @on-blur="validate($event, 'password')"
          ref="password"
          placeholder="8~15字,含大写字母及数字"
          autocomplete="off"
          title="密码"
          label-width="100"
          v-model="user.password">
        </x-input>
        <x-input
          :class="{'weui-cell_warn': inputErrors['confirmation_password']}"
          show-clear
          type="password"
          @on-change="validate($event, 'confirmation_password')"
          @on-blur="validate($event, 'confirmation_password')"
          ref="confirmation_password"
          autocomplete="off"
          title="确认密码"
          label-width="100"
          v-model="user.confirmation_password">
        </x-input>
        <x-input
          :class="{'weui-cell_warn': inputErrors['nickname']}"
          show-clear
          @on-change="validate($event, 'nickname')"
          @on-blur="validate($event, 'nickname')"
          ref="nickname"
          title="昵称"
          label-width="100"
          v-model="user.nickname">
        </x-input>
      </group>
      <div class="actions">
        <div v-if="error" class="error">{{error}}</div>
        <x-button type="primary"
                  action-type ="button"
                  :show-loading="loading"
                  :disabled="loading"
                  @click.native="submitForm">
                  注册
        </x-button>
      </div>
    </form>
  </div>
</template>

<script>
  import { checkUserName, register } from '../api'
  import { validateUserName, validatePassword, msgFormatter } from '../utils'
  import { XInput, Group, XButton, Flexbox, FlexboxItem, Selector, Cell, Popup, CheckIcon, TransferDom } from 'vux'
  const usernameValidator = (value, type) => {
    return new Promise((resolve, reject) => {
      if (!value) {
        resolve('请输入用户名称')
      } else if (!validateUserName(value)) {
        resolve('请输入6~15位英数字')
      } else {
        checkUserName(value).then(response => {
          if (response.existed) {
            resolve('用户名已经存在')
          } else {
            resolve('')
          }
        })
      }
    })
  }
  const passwordValidator = (value) => {
    return new Promise((resolve, reject) => {
      if (!value) {
        resolve('请输入密码')
      } else if (!validatePassword(value)) {
        resolve('请输入8~15字元，其中至少包含一大写字母及一数字')
      } else {
        resolve('')
      }
    })
  }
  const repeatPasswordValidator = (repeatValue, value) => {
    return new Promise((resolve, reject) => {
      if (value !== repeatValue) {
        resolve('两次输入密码不一致')
      } else {
        resolve('')
      }
    })
  }
  const nicknameValidator = (value) => {
    return new Promise((resolve, reject) => {
      if (!value) {
        resolve('请输入昵称')
      } else {
        resolve('')
      }
    })
  }
export default {
    name: 'Register',
    data () {
      return {
        user: {
          username: '',
          nickname: '',
          password: '',
          confirmation_password: ''
        },
        captcha_src: '',
        error: '',
        valid: true,
        confirmPasswordIsValid: true,
        inputErrors: {
          username: '',
          password: '',
          confirmation_password: '',
          nickname: ''
        },
        validators: {
          username: usernameValidator,
          password: passwordValidator,
          confirmation_password: repeatPasswordValidator,
          nickname: nicknameValidator
        },
        loading: false
      }
    },
    methods: {
      validate (value, input) {
        let currentValue = value || this.user[input]
        if (input === 'confirmation_password') {
          this.validators['confirmation_password'](currentValue, this.user.password).then(msg => {
            this.inputErrors[input] = msg
          })
        } else {
          this.validators[input](currentValue).then(msg => {
            this.inputErrors[input] = msg
            if (input === 'password') {
              this.validate(this.user.confirmation_password, 'confirmation_password')
            }
          })
        }
      },
      validateAll () {
        const inputs = ['username', 'password', 'confirmation_password', 'nickname']
        const validatePromises = inputs.map(input => {
          const currentValue = this.user[input]
          if (input === 'confirmation_password') {
            return this.validators['confirmation_password'](currentValue, this.user.password).then(msg => {
              this.inputErrors['confirmation_password'] = msg
              return msg
            })
          } else {
            return this.validators[input](currentValue).then(msg => {
              this.inputErrors[input] = msg
              return msg
            })
          }
        })
        return Promise.all(validatePromises)
      },
      submitForm () {
        this.validateAll().then(msgs => {
          const isValid = msgs.filter(msg => { return msg }).length === 0
          if (isValid) {
            this.loading = true
            register(this.user).then(result => {
              return this.$store.dispatch('login', {
                user: {
                  username: this.user.username,
                  password: this.user.password
                }
              })
            }).then(result => {
              this.$router.push({ path: '/chatroom' })
              this.$store.dispatch('fetchUser')
            }, errorMsg => {
              this.loading = false
              this.error = msgFormatter(errorMsg)
            }).catch(() => {
              this.loading = false
            })
          }
        })
      }
    },
    computed: {
      showInputErrors () {
        const keys = Object.keys(this.inputErrors)
        const errors = []
        keys.forEach(key => {
          const msg = this.inputErrors[key]
          if (msg) {
            errors.push(msg)
          }
        })
        return errors
      }
    },
    created () {
    },
    components: {
      XInput,
      Group,
      XButton,
      Flexbox,
      FlexboxItem,
      Selector,
      Cell,
      Popup,
      CheckIcon
    },
    directives: {
      TransferDom
    }
  }
</script>

<style lang="less" scoped>
@import '../styles/vars.less';

.error {
  color: #ff9800;
  text-align: center;
  margin-bottom: 0.5em;
}
.actions {
  margin-top: 1em;
  padding: 0 1em;
}
.captcha {
  vertical-align: middle;
}
.withdraw-password {
  position: relative;
  padding: 10px 15px;
}
.withdraw-password:before {
  content: " ";
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: 1px;
  border-top: 1px solid #D9D9D9;
  color: #D9D9D9;
  transform-origin: 0 0;
  transform: scaleY(0.5);
  left: 15px;
}
.weui-cell_select /deep/ .weui-select {
  border: 1px solid #ddd;
  padding-right: 0;
}
.weui-cell_select /deep/ .weui-cell__bd:after {
  border-width: 0px 2px 2px 0;
  right: 8px;
  margin-top: -5px;
}
.weui-cell__hd /deep/ .weui-label {
  width: 80px;
}
</style>
