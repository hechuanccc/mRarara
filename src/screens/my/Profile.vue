<template>
  <div>
    <group label-width="'100px'" title="基本资料">
      <div v-if="inputErrors.length">
        <ul class="input-errors">
          <li class="text" v-for="(error, index) in inputErrors" :key="index">
            {{error}}
          </li>
        </ul>
      </div>
      <x-input
        autocapitalize="off"
        title="昵称"
        @on-change="validate($event, 'nickname')"
        :value="member.nickname">
      </x-input>
      <x-input
        autocapitalize="off"
        title="手机号码"
        @on-change="validate($event, 'mobile')"
        :max="11"
        keyboard="number"
        :value="member.mobile">
      </x-input>
      <x-input
        autocapitalize="off"
        title="邮箱地址"
        type="email"
        @on-change="validate($event, 'email')"
        :value="member.email">
      </x-input>
      <x-input
        autocapitalize="off"
        title="QQ号"
        :max="8"
        @on-change="validate($event, 'QQ')"
        keyboard="number"
        :value="member.QQ">
      </x-input>
    </group>
    <div class="vux-group-tip text-danger">{{errorMsg}}</div>
    <div class="m-a">
      <x-button type="primary" :disabled="!hasChange" @click.native="submit">
        <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
        <span v-else>提交</span>
      </x-button>
    </div>
  </div>
</template>
<script>
import { Cell, Group, XInput, XButton, Datetime, Selector, Spinner } from 'vux'
import { msgFormatter, validateEmail, validatePhone, validateQQ } from '../../utils'
import { mapActions, mapGetters } from 'vuex'
import { changeUserInfo } from '../../api'
const inputs = ['nickname', 'email', 'mobile', 'QQ']
export default {
  name: 'profile',
  data () {
    return {
      validators: {
        nickname: {
          origin: '',
          valid: true,
          validate: (value) => {
            if (!value) {
              return '请输入昵称'
            }
            return ''
          },
          errorMsg: ''
        },
        mobile: {
          origin: '',
          valid: true,
          validate: (value) => {
            if (!value) {
              return '请输入手机号码'
            } else if (!validatePhone(value)) {
              return '手机号码格式错误'
            }
            return ''
          },
          errorMsg: ''
        },
        email: {
          origin: '',
          valid: true,
          validate: (value) => {
            if (!value) {
              return '请输入邮箱地址'
            } else if (!validateEmail(value)) {
              return '邮箱地址格式错误'
            }
            return ''
          },
          errorMsg: ''
        },
        QQ: {
          origin: '',
          valid: true,
          validate: (value) => {
            if (!value) {
              return '请输入QQ号'
            } else if (!validateQQ(value)) {
              return 'QQ号格式错误'
            }
            return ''
          },
          errorMsg: ''
        }
      },
      member: {
        nickname: '',
        mobile: '',
        email: '',
        QQ: ''
      },
      loading: false,
      errorMsg: '',
      valid: false
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ]),
    inputErrors () {
      return inputs.filter(input => {
        return this.validators[input].valid === false
      }).map(input => {
        return this.validators[input].errorMsg
      })
    },
    hasChange () {
      return inputs.filter(input => {
        return this.validators[input].origin !== this.member[input]
      }).length
    }
  },
  created () {
    this.init()
  },
  methods: {
    init () {
      inputs.forEach(input => {
        this.member[input] = this.user[input] || ''
        this.validators[input].origin = this.user[input] || ''
      })
    },
    ...mapActions([
      'fetchUser'
    ]),
    validate (value, input) {
      this.member[input] = value
      const validator = this.validators[input]
      if (value === validator.origin) {
        validator.valid = true
        validator.errorMsg = ''
      } else {
        const errorMsg = validator.validate(value)
        if (errorMsg) {
          validator.valid = false
          validator.errorMsg = errorMsg
        } else {
          validator.valid = true
          validator.errorMsg = ''
        }
      }
    },
    validateAll () {
      inputs.forEach(input => {
        this.validators[input].validate()
      })
      return !this.inputErrors.length
    },
    submit () {
      if (this.validateAll()) {
        this.loading = true
        changeUserInfo(this.user.id, this.member).then((response) => {
          this.loading = false
          this.$store.dispatch('fetchUser').then(() => {
            this.init()
          })
        }, (response) => {
          this.loading = false
          this.errorMsg = msgFormatter(response)
        })
      }
    }
  },
  components: {
    Group,
    Cell,
    XInput,
    XButton,
    Datetime,
    Selector,
    Spinner
  }
}
</script>
<style @lang="less">
.fix-arrow > .weui_cell_ft.with_arrow::after {
  content: " ";
  display: inline-block;
  transform: rotate(45deg) translateY(-50%);
  height: 6px;
  width: 6px;
  border-width: 2px 2px 0 0;
  border-color: #C8C8CD;
  border-style: solid;
  position: absolute;
  top: 50%;
  right: 15px;
}
</style>
