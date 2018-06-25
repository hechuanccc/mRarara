<template>
<div class="container">
  <iframe class="results-frame" scrolling="no" src="$store.state.systemConfig.mobileLotteryUrl" frameborder="0">
  </iframe>
</div>
</template>
<script>
export default {
  name: 'OnlineBet'
}
</script>

<style lang="less" scoped>
.container {
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  height: 100%;
}
.results-frame {
  height: 100%;
  width: 1px;
  min-width: 100%;
}
</style>

