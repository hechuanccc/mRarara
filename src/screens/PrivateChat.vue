<template>
  <group class="rooms">
    <cell
      v-if="room.target && room.users.length > 1"
      :key="'room' + index"
      v-for="(room, index) in rooms"
      is-link
      :title="`${isCustomerService(room.users[1].roles)? '客服人员 ':''}${room.users[1].nickname}`"
      :link="{path:'/private/'+room.id}"
      :border-intent="false"
      @click.native="chooseRoom(room.users[1].nickname)">
      {{ room.last_message.content }}
    </cell>
  </group>
</template>

<script>
import { fetchMemberRoom } from '../api'
import { Group, Cell } from 'vux'

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
      rooms: []
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  created () {
    this.fetchRooms()
  },
  methods: {
    fetchRooms () {
      this.loading = true
      return fetchMemberRoom(20, 0).then(res => {
        const results = res.results
        const rooms = this.page === 0 ? results : this.rooms.concat(results)
        this.page += 1
        if (results.length < this.limit) {
          this.ended = true
        }
        this.loading = false
        this.rooms = rooms.map(room => {
          return {
            ...room,
            target: room.type !== 1 ? room.users[0] : undefined
          }
        })
      })
    },
    chooseRoom (nickname) {
      this.$store.dispatch('setCustomTitle', nickname)
    },
    isCustomerService (roles) {
      return roles.some(role => role.id === 4)
    }
  }
}
</script>

<style lang="scss" scoped="">
.rooms /deep/ .weui-cells {
  margin-top: 5px;
}
</style>
