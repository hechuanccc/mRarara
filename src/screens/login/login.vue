<template>
  <form class="container" autocomplete="off">
    <group>
      <x-input
        required
        show-clear
        ref="username"
        @on-change="validate"
        :title="$t('misc.username')"
        label-width="100"
        v-model="user.username">
      </x-input>
      <x-input
        required
        show-clear
        type="password"
        ref="password"
        autocomplete="off"
        @on-change="validate"
        :title="$t('misc.password')"
        label-width="100"
        v-model="user.password">
      </x-input>
    </group>
    <div v-if="error" class="error">{{error}}</div>
    <div class="actions">
      <a href="javascript://" class="zcxy" target="_blank">游客体验</a>
      <group class="weui-cells_form">
          <x-button type="primary"
                    action-type ="button"
                    :disabled="!valid"
                    @click.native="submit">登录
          </x-button>
      </group>
    </div>
  </form>
</template>

<script>
  import {XInput, Group, XButton, Flexbox, FlexboxItem} from 'vux'

  export default {
    name: 'login',
    data () {
      return {
        user: {
          username: '',
          password: '',
          verification_code_0: ''
        },
        valid: false,
        error: ''
      }
    },
    components: {
      XInput,
      Group,
      XButton,
      Flexbox,
      FlexboxItem
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
        if (this.valid) {
          this.$store.dispatch('login', {
            user: this.user
          }).then(res => {
            this.error = ''
            this.loading = false
            this.$router.push('/')
          }, error => {
            this.loading = false
            this.error = error
          })
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .container {
    padding: 0 3em;
  }
  .actions {
    margin-top: 1em;
    padding: 0 1em;
    .weui-cells_form {
      width: 50%;
    }
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
  a.zcxy {
    float: right;
    text-decoration: underline;
    line-height: 58px;
    margin-left: 15px;
    color: #959ca8;
  }
</style>
