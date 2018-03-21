import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      meta: {
        title: '登录'
      },
      component: resolve => { require(['../screens/Login.vue'], resolve) }
    },
    {
      path: '/',
      redirect: '/chatroom'
    },
    {
      path: '/register',
      name: 'Register',
      meta: {
        title: '注册'
      },
      component: resolve => { require(['../screens/Register.vue'], resolve) }
    },
    {
      path: '/private',
      name: 'PrivateChat',
      component: resolve => { require(['../screens/PrivateChat.vue'], resolve) },
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/private/:chatWithId',
      name: 'PrivateChatroom',
      component: resolve => { require(['../components/ChatRoom.vue'], resolve) },
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/chatroom',
      name: 'ChatRoom',
      component: resolve => { require(['../components/ChatRoom.vue'], resolve) },
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/results',
      name: 'Results',
      component: resolve => { require(['../screens/ResultPage.vue'], resolve) },
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
        requiresAuth: true
      }
    },
    {
      path: '/my/profile',
      name: 'profile',
      meta: {
        title: '修改账户资料',
        requiresAuth: true
      },
      component: resolve => { require(['../screens/my/Profile.vue'], resolve) }
    },
    {
      path: '/my/password',
      name: 'password',
      meta: {
        title: '重设密码',
        requiresAuth: true
      },
      component: resolve => { require(['../screens/my/Password.vue'], resolve) }
    },
    {
      path: '/my/image',
      name: 'image',
      meta: {
        title: '修改头像',
        requiresAuth: true
      },
      component: resolve => { require(['../screens/my/Img.vue'], resolve) }
    },
    {
      path: '/my/envelope',
      name: 'EnvelopRecord',
      meta: {
        title: '红包纪录',
        requiresAuth: true
      },
      component: resolve => { require(['../screens/my/EnvelopeRecord.vue'], resolve) }
    },
    {
      path: '*',
      redirect: '/chatroom'
    }
  ]
})
