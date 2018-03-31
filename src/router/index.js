import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'
import { MEMBER, VISITOR } from '../customConfig'

const privatePageAuthCheck = (to, from, next) => {
  if (store.state.user.viewRole === MEMBER) {
    next()
  } else {
    next('/chatroom')
  }
}
const myPageAuthCheck = (to, from, next) => {
  if (store.state.user.viewRole === VISITOR) {
    next('/chatroom')
  } else {
    next()
  }
}
Vue.use(Router)
export default new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      meta: {
        title: '登录'
      },
      component: resolve => { require(['../screens/Login.vue'], resolve) },
      beforeEnter: (to, from, next) => {
        if (store.state.user.logined) {
          next('/chatroom')
        } else {
          next()
        }
      }
    },
    {
      path: '/',
      redirect: '/chatroom'
    },
    {
      path: '/register',
      name: 'Register',
      meta: {
        title: '注册',
        showBack: true
      },
      component: resolve => { require(['../screens/Register.vue'], resolve) }
    },
    {
      path: '/private',
      name: 'PrivateChat',
      meta: {
        requiresAuth: true,
        title: '联系客服'
      },
      beforeEnter: privatePageAuthCheck,
      component: resolve => { require(['../screens/PrivateChat.vue'], resolve) }
    },
    {
      path: '/private/:chatWithId',
      name: 'PrivateChatroom',
      meta: {
        requiresAuth: true,
        title: '联系客服',
        showBack: true
      },
      beforeEnter: privatePageAuthCheck,
      component: resolve => { require(['../components/ChatRoom.vue'], resolve) }
    },
    {
      path: '/chatroom',
      name: 'ChatRoom',
      meta: {
        requiresAuth: true,
        title: '首页'
      },
      component: resolve => { require(['../components/ChatRoom.vue'], resolve) }
    },
    {
      path: '/results',
      name: 'Results',
      meta: {
        requiresAuth: true,
        title: '开奖'
      },
      component: resolve => { require(['../screens/ResultPage.vue'], resolve) }
    },
    {
      path: '/my',
      name: 'my',
      meta: {
        title: '我的账户',
        requiresAuth: true
      },
      beforeEnter: myPageAuthCheck,
      component: resolve => { require(['../screens/My.vue'], resolve) }
    },
    {
      path: '/my/profile',
      name: 'profile',
      meta: {
        title: '修改账户资料',
        requiresAuth: true,
        showBack: true
      },
      beforeEnter: myPageAuthCheck,
      component: resolve => { require(['../screens/my/Profile.vue'], resolve) }
    },
    {
      path: '/my/password',
      name: 'password',
      meta: {
        title: '重设密码',
        requiresAuth: true,
        showBack: true
      },
      beforeEnter: myPageAuthCheck,
      component: resolve => { require(['../screens/my/Password.vue'], resolve) }
    },
    {
      path: '/my/image',
      name: 'image',
      meta: {
        title: '修改头像',
        requiresAuth: true,
        showBack: true
      },
      beforeEnter: myPageAuthCheck,
      component: resolve => { require(['../screens/my/Img.vue'], resolve) }
    },
    {
      path: '/my/envelope',
      name: 'EnvelopRecord',
      meta: {
        title: '红包纪录',
        requiresAuth: true,
        showBack: true
      },
      beforeEnter: myPageAuthCheck,
      component: resolve => { require(['../screens/my/EnvelopeRecord.vue'], resolve) }
    },
    {
      path: '*',
      redirect: '/chatroom'
    }
  ]
})
