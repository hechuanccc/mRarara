<template>
  <div>
    <form class="container" autocomplete="off">
      <group :title="'快速注册请注意格式'">
        <div v-if="!valid">
          <ul slot="after-title" class="input-errors">
            <li class="text" v-for="(error, index) in inputErrors" :key="index">
              {{error}}
            </li>
          </ul>
        </div>
        <x-input
          required
          show-clear
          :is-type="checkValid.checkUser"
          @on-change="validate"
          @on-blur="validate"
          ref="username"
          :placeholder="$t('validate.username_validate')"
          :title="$t('misc.username')"
          label-width="100"
          v-model="user.username">
        </x-input>
        <x-input
          required
          show-clear
          @on-change="validate"
          @on-blur="validate"
          ref="usernick"
          :title="$t('misc.usernick')"
          label-width="100"
          v-model="user.username">
        </x-input>
        <x-input
          required
          show-clear
          :is-type="checkValid.checkPassword"
          type="password"
          @on-change="validate"
          @on-blur="validate"
          ref="password"
          autocomplete="off"
          :title="$t('misc.password')"
          label-width="100"
          v-model="user.password">
        </x-input>
        <x-input
          required
          show-clear
          type="password"
          :is-type="checkValid.checkPasswordConfirmation"
          @on-change="validate"
          @on-blur="validate"
          ref="confirmation_password"
          autocomplete="off"
          :title="$t('misc.confirm_password')"
          label-width="100"
          v-model="user.confirmation_password">
        </x-input>
      </group>
      <div v-if="error" class="error">{{error}}</div>
      <div class="actions">
        <a href="javascript://" class="zcxy" target="_blank">注册协议</a>
        <group class="weui-cells_form">
          <x-button type="primary"
                    action-type ="button"
                    :show-loading="false"
                    :disabled="false"
                    @click.native="submitForm">
            同意协议并注册
          </x-button>
        </group>
      </div>
    </form>


  </div>
</template>

<script>
  import { checkUserName, register } from '../../api'
  import { validateUserName, validatePassword, msgFormatter } from '@/utils'
  import { XInput, Group, XButton, Flexbox, FlexboxItem, Selector, Cell } from 'vux'

  export default {
    name: 'Register',
    data () {
      return {
        user: {
          username: '',
          password: '',
          confirmation_password: '',
          real_name: '',
          phone: '',
          email: '',
          withdraw_password: '',
          verification_code_0: '',
          verification_code_1: ''
        },
        checkValid: {
          checkUser: (val) => {
            if (validateUserName(val)) {
              checkUserName(val).then(response => {
                this.usernameNotUsed = response.length > 0
              })
            }
            return {
              valid: this.usernameNotUsed > 0 && validateUserName(val),
              msg: !validateUserName(val) ? this.$t('validate.validate_error') : this.$t('validate.username_exist')
            }
          },
          checkPassword: (val) => {
            return {
              valid: this.user.confirmation_password ? validatePassword(val) && this.user.confirmation_password === val : validatePassword(val),
              msg: this.user.confirmation_password === val ? this.$t('validate.validate_error') : this.$t('validate.password_diff')
            }
          },
          checkPasswordConfirmation: (val) => {
            return {
              valid: this.user.password === val,
              msg: this.$t('validate.password_diff')
            }
          }
        },
        error: '',
        valid: true,
        inputErrors: []
      }
    },
    methods: {
      submitForm () {
        register(this.user).then(result => {
          return this.$store.dispatch('login', {
            user: {
              username: this.user.username,
              password: this.user.password
            }
          })
        }).then(result => {
          this.$router.push({ name: 'Home' })
        }, errorMsg => {
          this.error = msgFormatter(errorMsg)
        })
      },
      validate () {
        let valid = true
        let msg = []
        for (let x in this.$refs) {
          let input = this.$refs[x]
          valid = input.valid && valid
          if (input && input.touched) {
            let errors = input.errors
            let title = input.title
            let key = Object.keys(errors)[0]
            if (errors[key] && !input.valid) {
              if (errors[key].indexOf(title) === -1) {
                msg.push(title + errors[key])
              } else {
                msg.push(errors[key])
              }
            }
          }
        }
        this.inputErrors = msg
        this.valid = valid && !!this.password.confirmation_password
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
      Cell
    }
  }
</script>

<style lang="less" scoped>
  .container {
    padding: 0 1em;
  }
  .actions {
    margin-top: 1em;
    .weui-btn_disabled.weui-btn_primary {
      background-color: #2795dc;
    }
    .weui-btn_primary {
      background-color: #2795dc;
    }
  }
  .error {
    color: #E64340;
    text-align: center;
    margin-bottom: 0.5em;
  }
  .actions {
    margin-top: 1em;
    padding: 0 1em;
  }

  .input-errors {
    font-size: 14px;
    margin-left: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
    .text {
      list-style: circle inside;
      color: #ff9800;
    }
  }
  a.zcxy {
    float: right;
    text-decoration: underline;
    line-height: 58px;
    margin-left: 15px;
    color: #959ca8;
  }
</style>
