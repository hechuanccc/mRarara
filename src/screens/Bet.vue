<template>
  <iframe v-if="$store.state.systemConfig.mobileLotteryUrl" class="results-frame" :src="$store.state.systemConfig.mobileLotteryUrl" frameborder="0"></iframe>
  <div v-else class="results-frame text-center not-yet">
    暂不开放
  </div>
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

.not-yet {
  padding-top: 40px;
}
</style>

