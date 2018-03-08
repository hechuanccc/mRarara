<template>
  <group class="rooms">
    <cell
      :key="index"
      v-for="(member, index) in chatlist"
      is-link
      :title="`客服人员${index+1}`"
      :link="{path: '/private/' + member.id}"
      :border-intent="false">
      <div
        slot="icon"
        class="avatar"></div>
      <div v-if="!unreadRooms[member.id]" class="notify"></div>
    </cell>
  </group>
</template>

<script>
import { Group, Cell } from 'vux'
import { mapState } from 'vuex'

export default {
  name: 'PrivateChat',
  components: {
    Group,
    Cell
  },
  data () {
    return {
      limit: 20,
      page: 0,
      loading: false
    }
  },
  computed: {
    ...mapState([
      'user', 'chatlist', 'unreadRooms'
    ]),
    isCustomerService () {
      return this.$store.state.user.roles.some(role => role.id === 4)
    }
  }
}
</script>

<style lang="scss" scoped="">
.rooms /deep/ .weui-cells {
  margin-top: 5px;
}
.avatar {
  width: 35px;
  height: 35px;
  background-image: url('../assets/stick_admin.png');
  background-repeat: no-repeat;
  background-size: contain;
  margin-right: 10px;
}
.notify {
  width: 6px;
  height: 6px;
  background-color: #f5a623;
  border-radius: 50%;
}
</style>
