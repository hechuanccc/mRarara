<template>
<group title="红包纪录">
  <x-table
    v-infinite-scroll="loadMore"
    :infinite-scroll-distance="10"
    :cell-bordered="false"
    :style="tableStyle">
    <thead class="thead">
      <tr>
        <th width="25%">收发</th>
        <th width="35%">紅包總額</th>
        <th width="40%">时间</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(rec, index) in records" :key="index">
        <td>{{rec.status}}</td>
        <td>{{rec.amount>0?'+':''}}{{rec.amount | currency('￥')}}</td>
        <td>{{rec.created_at | moment('YYYY-MM-DD HH:mm:ss')}}</td>
      </tr>
    </tbody>
  </x-table>
</group>
</template>

<script>
import { Group, XTable, XButton } from 'vux'
import { fetchEnvelopeRecord } from '../../api'
import infiniteScroll from 'vue-infinite-scroll'
export default {
  name: 'EnvelopeRecord',
  components: {
    Group,
    XTable,
    XButton
  },
  directives: {
    infiniteScroll
  },
  data () {
    return {
      tableStyle: {
        color: '#4a4a4a',
        'font-size': '12px',
        'background-color': '#fff'
      },
      offset: 0,
      limit: 20,
      records: [],
      totalCount: 0,
      busy: true
    }
  },
  created () {
    fetchEnvelopeRecord({offset: this.offset, limit: this.limit}).then(res => {
      this.records = res.results
      this.totalCount = res.count
      this.busy = false
    }).catch(() => {})
  },
  methods: {
    loadMore () {
      if (this.busy || this.offset > this.totalCount) {
        return
      }
      this.offset = this.offset + this.limit
      fetchEnvelopeRecord({offset: this.offset, limit: this.limit}).then(res => {
        this.records = this.records.concat(res.results)
      }).catch(() => {})
    }
  }
}
</script>

<style lang="less" scoped>
.thead {
  color: #4a4a4a;
  font-size: 14px;
}
</style>

