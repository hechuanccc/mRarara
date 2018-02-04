<template>
	<ChatRoom></ChatRoom>
</template>

<script>
import ChatRoom from '../components/ChatRoom'
export default {
  name: 'Home',
  created () {
    if (this.$route.path === '/') {
      this.$router.replace({path: '/chatroom'})
    }
  },
  components: {
    ChatRoom
  }
}
</script>
