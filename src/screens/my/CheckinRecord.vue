<template>
<group title="签到纪录">
  <x-table
    v-infinite-scroll="loadMore"
    :infinite-scroll-distance="10"
    :cell-bordered="false"
    :style="tableStyle">
    <thead class="thead">
      <tr>
        <th width="20%">签到装置</th>
        <th width="20%">获得金额</th>
        <th width="20%">连续天数</th>
        <th width="40%">签到时间</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(rec, index) in records" :key="index">
        <td>{{rec.platform|platformFilter}}</td>
        <td>{{rec.special_reason?rec.special_bonus:rec.normal_bonus | currency('￥')}}</td>
        <td>{{rec.continuous_checkins}}</td>
        <td>{{rec.checkin_time | moment('YYYY-MM-DD HH:mm:ss')}}</td>
      </tr>
    </tbody>
  </x-table>
</group>
</template>

<script>
import { Group, XTable, XButton } from 'vux'
import { fetchCheckinRecord } from '../../api'
import infiniteScroll from 'vue-infinite-scroll'
export default {
  name: 'CheckinRecord',
  filters: {
    platformFilter (val) {
      switch (val) {
        case 1:
          return '手机'
        case 0:
          return '桌机'
      }
      return ''
    }
  },
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
    fetchCheckinRecord({offset: this.offset, limit: this.limit}).then(res => {
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
      fetchCheckinRecord({offset: this.offset, limit: this.limit}).then(res => {
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

