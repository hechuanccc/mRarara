import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      meta: {
        tabbarHidden: true,
        title: '登录',
        showBack: true
      },
      component: resolve => { require(['../screens/Login.vue'], resolve) }
    },
    {
      path: '/',
      name: 'Home',
      meta: {

      },
      component: resolve => { require(['../screens/Home.vue'], resolve) }
    },
    {
      path: '/register',
      name: 'Register',
      meta: {
        tabbarHidden: true,
        title: '注册',
        showBack: true
      },
      component: resolve => { require(['../screens/Register.vue'], resolve) }
    },
    {
      path: '/bet',
      name: 'Bet',
      component: resolve => { require(['../screens/Bet.vue'], resolve) },
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/my',
      name: 'my',
      component: resolve => { require(['../screens/My.vue'], resolve) },
      meta: {
        title: '个人中心',
        showBack: true,
        requiresAuth: true,
        tabbarHidden: true
      }
    },
    {
      path: '/my/profile',
      name: 'profile',
      meta: {
        title: '修改账户资料',
        showBack: true,
        tabbarHidden: true,
        requiresAuth: true
      },
      component: resolve => { require(['../screens/my/Profile.vue'], resolve) }
    }
  ]
})
