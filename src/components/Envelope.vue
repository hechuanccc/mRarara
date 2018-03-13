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
        case 0:
          return '已过期'
        case 1:
          return '已领取'
        case 2:
          return '已领完'
        case 3:
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
        users: envelopeStatus.users
      }

      if (envelopeStatus.expired) {
        status = 0
      } else if (this.checkIfUserExist(envelopeStatus.users)) {
        status = 1
        data.amount = envelopeStatus.amount
      } else if (envelopeStatus.remaining === 0) {
        status = 2
      } else {
        status = 3
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
  height: 60px;
  border-radius: 5px;
  background-color: #fa9d3b;
  padding: 13px 12px;
  color: #fff;
  .icon {
    height: 36px;
    width: 36px;
    background: url('../assets/envelope_msg.png') no-repeat;
    background-size: cover;
    margin-right: 5px;
  }
  .content {
    height: 36px;
    .msg {
      height: 18px;
      line-height: 18px;
      font-size: 12px;
    }
    .status {
      height: 18px;
      line-height: 18px;
      font-weight: bold;
      transform: scale(0.8);
      transform-origin: left;
      font-size: 12px;
    }
  }
}
</style>

