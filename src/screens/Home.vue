<template>

</template>

<script>
export default {
  name: 'Home',
  created () {
    if (this.$route.path === '/') {
      this.$router.replace({path: '/chatroom'})
    }
  }
}
</script>

