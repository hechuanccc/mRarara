<template>
  <div class="container">
    <div class="title">
      <div class="rule-btn" @click="isShowRule = true">
        <icon scale="1" name="question-circle-o"></icon>&nbsp;签到规则
      </div>
      <div class="text">每日签到</div>
      <div class="close" @click="$emit('closeCheckin')">
        <div class="close-btn"></div>
      </div>
    </div>
    <div class="progress">
      <div class="text">连续签到<span class="day">{{user.continuous_checkins|addZeroFilter}}</span>天</div>
      <div class="graph">
        <div class="line">
          <div class="fill" :style="{width: calcProgress(7)}"></div>
        </div>
        <div :class="['dot', {active: user.continuous_checkins >= 7}]">
          <span class="day">7日</span>
        </div>
        <div class="line">
          <div class="fill" :style="{width: calcProgress(14)}"></div>
        </div>
        <div :class="['dot', {active: user.continuous_checkins >= 14}]">
          <span class="day">14日</span>
        </div>
        <div class="line">
          <div class="fill" :style="{width: calcProgress(21)}"></div>
        </div>
        <div :class="['dot', {active: user.continuous_checkins >= 21}]">
          <span class="day">21日</span>
        </div>
      </div>
    </div>
    <div class="body" v-if="!isSpecial">
      <div class="error text-danger">{{error}}</div>
      <div :class="['bonus',day.status, day.type, day.type==='special'?'special'+day.num:'' ]" v-for="day in days" :key="day.num" @click="checkin(day)">
        <div v-if="day.status === 'takable' && day.type==='special'" :class="day.status">领取</div>
        <div class="icon-bg">
          <div class="icon"></div>
        </div>
        <div class="ribbon"></div>
        <div class="text">{{day.type==='special'?day.num+'日奖励':day.num}}</div>
        <div v-if="day.status === 'success'" :class="day.status">成功</div>
        <div v-else-if="day.status === 'takable' && day.type==='normal'" :class="day.status">{{day.amount| currency('￥')}}</div>
      </div>
    </div>
    <div v-else class="win-bg">
      <div class="text">获取彩金</div>
      <div class="amount">{{amount| currency('￥')}}</div>
    </div>
    <transition name="fade">
      <div v-show="isShowRule" class="rule-panel">
        <div class="close-btn" @click="isShowRule = false"></div>
        <p>签到规则</p>
        <p>1.签到方式：</p>
        <p>用户登录时，在页面点击“签到”按钮进行签到，全天都可以签。</p>
        <p>2. 签到奖励：</p>
        <p>每日签到即获得签到彩金，连续签到7日、14日、21日能领取更多金额彩金</p>
      </div>
    </transition>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'
import { mapState } from 'vuex'
import 'vue-awesome/icons/question-circle-o'
import { checkin } from '../api'
import { msgFormatter } from '../utils'
export default {
  name: 'CheckinDialog',
  filters: {
    addZeroFilter (val) {
      return val < 10 ? '0' + val : val
    }
  },
  props: {
    show: {
      type: Boolean
    }
  },
  components: {
    Icon
  },
  data () {
    return {
      error: '',
      loading: false,
      checkinSuccess: false,
      isSpecial: false,
      amount: '',
      isShowRule: false
    }
  },
  computed: {
    ...mapState(['user', 'today', 'systemConfig']),
    isCheckin () {
      const lastCheckin = this.user.last_checkin
      return lastCheckin && !this.$moment(this.today).isAfter(lastCheckin, 'day')
    },
    days () {
      const days = []
      const checkinSuccess = this.checkinSuccess
      for (let i = 1; i <= 21; i++) {
        let day = {num: i, status: '', type: 'normal'}
        const continuousCheckin = this.user.continuous_checkins
        if (i % 7 === 0) {
          day.type = 'special'
        }

        if (i === continuousCheckin) {
          if (checkinSuccess) {
            day.status = 'success'
          } else {
            day.status = 'taken'
          }
        } else if (i === continuousCheckin + 1 && !this.isCheckin) {
          day.status = 'takable'
          day.amount = this.systemConfig.checkin_settings.single_day_amount
        } else if (i < continuousCheckin) {
          day.status = 'taken'
        }
        days.push(day)
      }
      return days
    }
  },
  watch: {
    'show': function (isShow) {
      if (isShow) {
        this.isSpecial = false
        this.checkinSuccess = false
      } else {
        this.isShowRule = false
      }
    }
  },
  methods: {
    calcProgress (day) {
      const continuousCheckin = this.user.continuous_checkins
      if (continuousCheckin >= day) {
        return '100%'
      }
      if (day - continuousCheckin >= 7) {
        return '0px'
      }
      return continuousCheckin % 7 * 10 + 'px'
    },
    checkin (day) {
      if (day.status !== 'takable' || this.loading) {
        return
      }

      this.loading = true
      checkin().then(res => {
        this.checkinSuccess = true
        this.loading = false
        if (res.special_reason) {
          this.amount = res.special_bonus
          this.isSpecial = true
        }
        this.$store.dispatch('fetchUser')
      }).catch(error => {
        this.error = msgFormatter(error)
        this.loading = false
      })
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  position: relative;
  width: 100%;
  color: #fff;
  font-size: 12px;
  .title {
    height: 40px;
    width: 100%;
    display: flex;
    align-items: center;
    .rule-btn {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      box-sizing: border-box;
      padding-left: 10px;
      width: 33%;
    }
    .text {
      height: 40px;
      line-height: 40px;
      width: 34%;
    }
    .close {
      height: 40px;
      width: 33%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }
  .progress {
    height: 90px;
    width: 100%;
    .text {
      height: 33px;
      width: 100%;
      text-align: center;
      .day {
        padding: 0 3px;
        font-size: 24px;
        font-weight: bold;
      }
    }
    .graph {
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      padding-top: 20px;
      height: 56px;
      width: 100%;
      .line {
        width: 60px;
        height: 4px;
        margin-right: 5px;
        background: #fff;
        border: none;
        .fill {
           background: #3e73b1;
           height: 100%;
           width: 100%;
        }
      }
      .dot {
        position: relative;
        height: 6px;
        width: 6px;
        box-sizing: border-box;
        border: 1px solid #fff;
        border-radius: 50%;
        margin-right: 5px;
        &.active{
          border-color: #3e73b1;
        }
        .day {
          position: absolute;
          display: inline-block;
          width: 26px;
          text-align: center;
          top: -25px;
          left: -13px;
        }
      }
    }
  }

  .body {
    height: 240px;
    width: 100%;
    background: #fff;
    display: flex;
    flex-wrap: wrap;
    position: relative;
    .error {
      position: absolute;
      top: 0;
      width: 100%;
      height: 25px;
      line-height: 25px;
      text-align: center;
    }
    .bonus {
      position: relative;
      box-sizing: border-box;
      width: 45px;
      height: 50px;
      margin-left: 2px;
      margin-top: 25px;
      border-radius: 5px;
      .icon-bg {
        box-sizing: border-box;
        padding-top: 3px;
        position: relative;
        display: flex;
        justify-content: center;
        height: 36px;
        width: 100%;
        background: #f8f7f3;
        border-radius: 5px 5px 0 0;
        .icon {
          display: inline-block;
          width: 30px;
          height: 30px;
          background: url('../assets/daily_money.png') no-repeat;
          background-size: contain;
        }
      }
      .text{
        display: flex;
        justify-content: center;
        height: 13px;
        line-height: 13px;
        width: 100%;
        background: #dfdfdf;
        border-radius: 0 0 5px 5px;
        color: #4a4a4a;
      }
      &.special7 {
        .icon-bg {
          .icon {
            background: url('../assets/gift_7.png') no-repeat;
            background-size: contain;
          }
        }
      }
      &.special14 {
        .icon-bg {
          .icon {
            background: url('../assets/gift_14.png') no-repeat;
            background-size: contain;
          }
        }
      }
      &.special21 {
        .icon-bg {
          .icon {
            background: url('../assets/gift_21.png') no-repeat;
            background-size: contain;
          }
        }
      }
      .hook() {
        &::after {
          position: absolute;
          top: 10px;
          left: 10px;
          display: block;
          content: '';
          width: 20px;
          height: 8px;;
          border-left: 3px solid #3e73b1;
          border-bottom: 3px solid #3e73b1;
          transform: rotate(-45deg);
        }
      }
      &.special{
        width: 50px;
        margin-left: 13px;
        margin-right: 10px;
        border: none;
        .text {
          position: relative;
          width: 100%;
          border-radius: 1px;
          height: 14px;
          background-image: linear-gradient(to bottom, #ffc75c, #fffa3b 33%, #ffc00d 86%, #e99917);
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
          color: #c0493c;
          font-weight: bold;
          border: none;
        }
        .ribbon {
          position: absolute;
          bottom: 2px;
          width: 50px;
          &::before, &::after {
            content: '';
            position: absolute;
            height: 0;
            width: 0;
            border-style: solid;
            border-width: 0;
            bottom: -2px;
          }
          &::before {
            border-color: #f5a623 #f5a623 #f5a623 transparent;
            left: -7px;
            border-width: 6px 9px 6px 5px;
          }
          &::after {
            border-color: #f5a623 transparent #f5a623 #f5a623;
            right: -7px;
            border-width: 6px 5px 6px 9px;
          }
        }
        .icon-bg {
          position: relative;
          height: 34px;
          background: transparent;
          border: none;
          .icon {
            height: 27px;
            width: 27px;
          }
        }
        &.taken {
          .text {
            border-radius: 1px;
            background-color: #dfdfdf;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
            background-image: none;
            color: #9b9b9b;
          }
          .icon-bg {
            .icon {
              background: url('../assets/gift_disable.png') no-repeat;
              background-size: contain;
            }
          }
          .hook();
          &::after {
            left: 12px;
          }
        .ribbon {
            &::before {
              border-color: #dfdfdf #dfdfdf #dfdfdf transparent;
            }
            &::after {
              border-color: #dfdfdf transparent #dfdfdf #dfdfdf;
            }
          }
        }
        &.takable {
          .icon-bg {
            .icon {
              margin-top: 10px;
            }
          }
        }
        .takable {
          position: absolute;
          width: 50px;
          height: 50px;
          bottom: 10px;
          background-color: #f8e71c;
          border-radius: 50%;
          color: #4a4a4a;
          font-weight: bold;
          box-sizing: border-box;
          padding-top: 3px;
        }
      }
      &.normal{
        .ribbon {
          display: none;
        }
        .success, .takable {
          position: absolute;
          top: -15px;
          left: -1px;
          width: 45px;
          height: 25px;
          line-height: 15px;
          background-repeat: no-repeat;
          background-size: contain;
        }
        .success {
          background-image: url('../assets/success.png');
        }
        .takable {
          background-image: url('../assets/hint_click.png');
        }
        &.success {
          border: solid 1px #3e73b1;
          .icon-bg{
            opacity: .5;
          }
          .text {
            opacity: .5;
            background: #3e73b1;
            color: #fff;
          }
          .hook();
        }
        &.taken {
          border: solid 1px #3e73b1;
          .icon-bg{
            opacity: .5;
          }
          .text {
            opacity: .5;
          }
          .hook();
        }
        &.takable {
          border: solid 1px #3e73b1;
          .text {
            background: #3e73b1;
            color: #fff;
          }
          box-shadow: 0 3px 5px 0 rgba(0, 0, 0, 0.5);
        }
      }
    }
  }

  .win-bg {
    width: 100%;
    height: 280px;
    background: url('../assets/win_bg.png') no-repeat;
    background-size: contain;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fff;
    text-align: center;
    font-weight: bold;
    .text {
      font-size: 20px;
    }
    .amount {
      font-size: 36px;
    }
  }
}
.rule-panel {
  position: relative;
  width: 100%;
  height: 145px;
  background: #fff;
  margin-top: 10px;
  box-sizing: border-box;
  padding: 8px 26px 12px 10px;
  text-align: left;
  color: #4a4a4a;
  font-size: 12px;
  .close-btn {
    position: absolute;
    top: 0;
    right: 0;
      &::before, &::after {
      position: absolute;
      content: ' ';
      top: 5px;
      right: 15px;
      height: 20px;
      width: 2px;
      background-color: #9b9b9b;
    }
  }
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>


