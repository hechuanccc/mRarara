<template>
  <div :class="['result-numbers', {'tie-up': gameCode === 'bjkl8' || gameCode === 'auluck8'}]">
    <span v-for="(num, index) in resultballs"
      :key="index"
      :class="[
        gameCode,
        `${gameCode}-${loading ? getPositiveNumber(baseNumber, num) : num}`,
      ]">
        <b :class="['num',
          {transition: loading && (index % 2)},
          {transition2: loading && !(index % 2)}]">
          {{loading ? getPositiveNumber(baseNumber, num , true) : num}}
        </b>
    </span>
  </div>
</template>
<script>
export default {
  name: 'ResultBall',
  props: {
    gameCode: {
      type: String
    },
    resultballs: {
      type: Array,
      default: []
    },
    count: {
      type: Object
    },
    baseNumber: {
      type: Number
    }
  },
  computed: {
    loading () {
      if (this.count) {
        return this.count.days + this.count.days + this.count.minutes + this.count.seconds === 0
      }
      return false
    }
  },
  methods: {
    getPositiveNumber (baseNumber, num, flag) {
      let diff = Math.abs(baseNumber - num)
      return flag || diff ? diff : baseNumber
    }
  }
}
</script>
<style lang="less" scoped>
@import '../styles/resultnumbers.less';
.result-numbers {
  display: block;
  margin-bottom: 10px;
  &.tie-up {
    width: 290px;
  }
}
</style>
