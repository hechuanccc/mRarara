<template>
<div class="container">
  <iframe class="results-frame" scrolling="no" src="http://zz79.com" frameborder="0">
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
  min-height: 820px; //fix android scrolling issue- must taller than iframe content height
}
</style>


