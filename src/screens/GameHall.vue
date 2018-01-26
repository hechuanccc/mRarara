<template>
  <div class="box">
    <tab>
      <tab-item
        :line-width="1"
        @on-item-click="initDeposit"
        :selected="true || view === 'login'">
        快速登录
      </tab-item>
      <tab-item
        :line-width="1"
        @on-item-click="initRemit"
        :selected="view === 'register'">
        快速注册
      </tab-item>
    </tab>
    <transition name="component-fade" mode="out-in">
      <component v-bind:is="view"></component>
    </transition>
  </div>
</template>

<script>
  import {Tab, TabItem} from 'vux'
  import login from './login/login'
  import register from './login/register'
  export default {
    data () {
      return {
        view: login
        // tabs: [
        //   {
        //     label: '快速登录',
        //     name: 'login'
        //   },
        //   {
        //     label: '快速注册',
        //     name: 'register'
        //   }
        // ]
      }
    },
    // watch: {
    //   '$route.name': function () {
    //     this.activeTab = this.$route.name
    //
    //     if (this.$route.name === 'Fin') { // to avoid not arrive recharge-page after user key .../fin/ directly
    //       this.$router.push({name: 'Recharge'})
    //     }
    //   }
    // },
    computed: {},
    components: {
      Tab,
      TabItem
    },
    methods: {
      initDeposit () {
        this.view = login
      },
      initRemit () {
        this.view = register
      }
    }
  }
</script>
<style scoped lang="less">

</style>
