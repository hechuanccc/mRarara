<template>
  <iframe :src="$store.state.systemConfig.mobileLotteryUrl" frameborder="0"></iframe>
</template>
<script>
export default {
  name: 'OnlineBet'
}
</script>

