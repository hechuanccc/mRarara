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
    }
    // {
    //   path: '/register',
    //   name: 'Register',
    //   meta: {
    //     tabbarHidden: true,
    //     title: '注册'
    //   },
    //   component: resolve => { require(['../screens/login/Register.vue'], resolve) }
    // }
    // {
    //   path: '/',
    //   name: 'Home',
    //   component: resolve => { require(['../screens/Home.vue'], resolve) }
    // }
  ]
})
