<template>
  <div class="container">
    <div class="status">503</div>
    <p class="p1">维护中，请稍后再试</p>
    <p class="p2">Thanks!</p>
  </div>
</template>

<script>
export default {
  name: 'Error'
}
</script>

<style lang="less" scoped>
.container{
  background: #eee;
  width: 100%;
  height: 100%;
  text-align: center;
  .status {
    width: 100%;
    height: 200px;
    line-height: 200px;
    font-size: 72px;
    color: #1976D2;
  }
  .p1 {
    width: 100%;
    font-size: 18px;
  }
  .p2 {
    margin-top: 20px;
    width: 100%;
    font-size: 14px;
  }
}
</style>


