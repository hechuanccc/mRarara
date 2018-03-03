<template>
  <group class="rooms">
    <cell
      :key="index"
      v-for="(member, index) in memberList"
      is-link
      :title="member.nickname"
      @click.native="buildRoom(member.id)"
      :border-intent="false">
      <div
        slot="icon"
        class="avatar"></div>
      <div v-if="!member.read" class="notify"></div>
    </cell>
  </group>
</template>

<script>
import { fetchChatlist, buildRoom } from '../api'
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
      loading: false,
      chatlist: []
    }
  },
  computed: {
    ...mapState([
      'user', 'messages'
    ]),
    memberList () {
      return this.chatlist.filter(member => member.id !== 1)
    },
    isCustomerService () {
      return this.$store.state.user.roles.some(role => role.id === 4)
    }
  },
  created () {
    this.fetchChatlist()
  },
  methods: {
    fetchChatlist () {
      this.loading = true
      fetchChatlist().then(chatlist => {
        this.chatlist = chatlist
      })
    },
    buildRoom (id) {
      buildRoom([this.user.id, id]).then(data => {
        this.$router.push({path: '/private/' + data.room.id})
      })
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
