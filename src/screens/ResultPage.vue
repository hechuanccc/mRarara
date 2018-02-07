<template>
  <div class="results-frame">
    <Result/>
  </div>
</template>

<script>
import Result from '../components/Result'

export default {
  name: 'Results',
  components: {
    Result
  }
}
</script>

<style lang="less" scoped>
 .results-frame {
   width: 100%;
   height: 100%;
   margin-top:10px;
 }
</style>

