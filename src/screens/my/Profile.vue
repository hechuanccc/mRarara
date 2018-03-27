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
        :class="{'weui-cell_warn': !validators['nickname'].valid}"
        autocapitalize="off"
        title="昵称"
        @on-change="validate($event, 'nickname')"
        :value="member.nickname">
      </x-input>
      <x-input
        :class="{'weui-cell_warn': !validators['mobile'].valid}"
        autocapitalize="off"
        title="手机号码"
        @on-change="validate($event, 'mobile')"
        :max="11"
        keyboard="number"
        :value="member.mobile">
      </x-input>
      <x-input
        :class="{'weui-cell_warn': !validators['QQ'].valid}"
        autocapitalize="off"
        title="QQ号"
        @on-change="validate($event, 'QQ')"
        keyboard="number"
        :value="member.QQ">
      </x-input>
    </group>
    <div :class="['text-center', 'm-t', response.success? 'text-success':'text-danger']">{{response.msg}}</div>
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
import { msgFormatter, validatePhone, validateQQ } from '../../utils'
import { mapActions, mapGetters } from 'vuex'
import { changeUserInfo } from '../../api'
const inputs = ['nickname', 'mobile', 'QQ']
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
        QQ: ''
      },
      loading: false,
      response: {
        msg: '',
        success: true
      },
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
  watch: {
    'hasChange': function (hasChange) {
      this.response.msg = ''
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
      this.response.msg = ''
      if (this.validateAll()) {
        this.loading = true
        changeUserInfo(this.user.id, this.member).then((response) => {
          this.loading = false
          this.$store.dispatch('fetchUser').then(() => {
            this.init()
            this.$nextTick(() => {
              this.loading = false
              this.response.success = true
              this.response.msg = '已修改完成'
            })
          })
        }, (response) => {
          this.response.success = false
          this.response.msg = msgFormatter(response)
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
