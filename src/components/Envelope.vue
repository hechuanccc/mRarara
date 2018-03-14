<template>
  <div class="container">
    <div class="icon"></div>
    <div class="content">
      <div class="msg">{{item.content}}</div>
      <div class="status">{{currentEnvelope.status | statusFilter}}</div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  filters: {
    statusFilter (val) {
      switch (val) {
        case 1:
          return '已过期'
        case 2:
          return '已领取'
        case 3:
          return '已领完'
        case 4:
          return '待领取'
      }
    }
  },
  name: 'Envelope',
  props: {
    item: {
      type: Object
    }
  },
  data () {
    return {

    }
  },
  computed: {
    ...mapState([
      'envelope', 'user'
    ]),
    currentEnvelope () {
      const envelopeId = this.item.envelope_status.id
      if (!this.envelope[envelopeId]) {
        return {}
      } else {
        return this.envelope[envelopeId]
      }
    }
  },
  created () {
    const envelopeId = this.item.envelope_status.id
    if (!this.envelope[envelopeId]) {
      this.$store.dispatch('updateEnvelope', this.checkEnvelopStatus(this.item))
    }
  },
  methods: {
    checkIfUserExist (users) {
      return users.some(user => this.user.id === user.receiver_id)
    },
    checkEnvelopStatus (item) {
      let status
      const envelopeStatus = item.envelope_status
      const data = {
        avatar: item.sender.avatar,
        sendername: item.sender.nickname,
        content: item.content,
        users: envelopeStatus.users,
        amount: envelopeStatus.amount
      }

      if (envelopeStatus.expired) {
        status = 1
      } else if (this.checkIfUserExist(envelopeStatus.users)) {
        status = 2
      } else if (envelopeStatus.remaining === 0) {
        status = 3
      } else {
        status = 4
      }
      data.status = status
      return {
        data: data,
        id: envelopeStatus.id
      }
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  display: flex;
  align-items: center;
  margin-top: 3px;
  box-sizing: border-box;
  width: 193px;
  height: 55px;
  border-radius: 5px;
  background-color: #fa9d3b;
  padding: 10px;
  color: #fff;
  font-weight: lighter;
  .icon {
    height: 36px;
    width: 36px;
    background: url('../assets/envelope_msg.png') no-repeat;
    background-size: cover;
    margin-right: 5px;
  }
  .content {
    height: 36px;
    width: calc(100% - 36px);
    .msg {
      height: 18px;
      width: 100%;
      overflow : hidden;
      line-height: 18px;
      font-size: 12px;
      text-overflow : ellipsis;
      white-space : nowrap;
    }
    .status {
      height: 18px;
      width: 100%;
      line-height: 18px;
      font-weight: bold;
      font-size: 12px;
    }
  }
}
</style>

