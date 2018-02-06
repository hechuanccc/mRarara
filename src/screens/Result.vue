<template>
  <!-- todo: apply api -->
  <iframe :src="$store.state.systemConfig.lotteryResultUrl" class="results-frame" width="100%" frameborder="0"></iframe>
</template>

<script>
export default {
  name: 'Result'
}
</script>

<style lang="scss" scoped>
 .results-frame {
   height: 100%;
   margin-top: 10px;
   margin-bottom: -10px;
 }
</style>

