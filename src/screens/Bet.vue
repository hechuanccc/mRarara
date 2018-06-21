<template>
  <iframe class="results-frame" :src="$store.state.systemConfig.mobileLotteryUrl" frameborder="0"></iframe>
</template>
<script>
export default {
  name: 'OnlineBet'
}
</script>

<style lang="less" scoped>
.results-frame {
  height: 100%;
  margin-bottom: -10px;
  width: 100%;
}
</style>

