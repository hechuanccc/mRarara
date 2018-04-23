<template>
  <div class="container">
    <div class="swiper-container">
      <div :class="['prev',{disabled: currentChunk === 0}]" @click="swipe('prev', currentChunk === 0)"></div>
      <swiper
        :style="{flex:'1 1 auto'}"
        height="45px"
        :show-dots="false"
        ref="swiper"
        v-model="currentChunk">
        <swiper-item
          v-for="(games, index) in gameChunks"
          :key="index">
          <ul class="games">
            <li class="game"
              v-for="(game, gameIndex) in games"
              :key="gameIndex">
              <div :class="['btn', {active: game.actived}]" @click="switchGame(game)">
                {{game.name}}
              </div>
            </li>
          </ul>
        </swiper-item>
      </swiper>
      <div :class="['next',{disabled: currentChunk >= gameChunks.length-1}]" @click="swipe('next', currentChunk >= gameChunks.length-1)"></div>
    </div>
    <div class="wrapper">
      <div v-if="activedGame" class="scheme-container">
        <ul class="schemes">
          <li
            :class="['scheme', {active: scheme.actived}]"
            v-for="(scheme, schemeIndex) in currentSchemes"
            :key="schemeIndex"
            @click="switchScheme(scheme)">
            {{scheme.display_name}}
          </li>
        </ul>
      </div>
      <div class="prediction-container" ref="view">
        <ul class="predictions">
          <li class="prediction" v-for="prediction in predictions" :key="prediction.id">
            <p class="title">{{`${prediction.issue_numbers} ${prediction.scheme}`}}</p>
            <p class="content">{{`(${prediction.numbers_predicted})`}}
              <span v-if="prediction.result&&Array.isArray(prediction.result.draw_result)">
                {{prediction.result.draw_result.join('，')}}
              </span>
            </p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import { fetchGame, fetchPrediction } from '../api'
import { Swiper, SwiperItem } from 'vux'
export default {
  name: 'Plan',
  components: {
    Swiper,
    SwiperItem
  },
  data () {
    return {
      games: [],
      gameChunks: [],
      currentChunk: 0,
      currentSchemes: [],
      predictions: [],
      predictionTimer: null,
      activedGame: null,
      currentScheme: null,
      loading: false
    }
  },
  watch: {
    'currentScheme': function (currentScheme) {
      if (currentScheme) {
        this.fetchPrediction(true)
        this.setTimer()
      }
    }
  },
  created () {
    fetchGame().then(res => {
      this.games = res.filter(game => game.plans.length)
      this.gameChunks = _.chunk(this.games, 4)
      this.games[0].actived = true
      this.activedGame = this.games[0]
      this.currentSchemes = this.games[0].plans[0].schemes
      this.currentSchemes[0].actived = true
      this.currentScheme = this.currentSchemes[0]
    })
  },
  activated () {
    this.setTimer()
    const view = this.$refs.view
    view.scrollTop = view.scrollHeight
  },
  deactivated () {
    clearTimeout(this.predictionTimer)
    this.predictionTimer = null
  },
  methods: {
    setTimer () {
      clearTimeout(this.predictionTimer)
      this.predictionTimer = setTimeout(() => {
        this.fetchPrediction()
        this.setTimer()
      }, 20000)
    },
    fetchPrediction (isChange) {
      this.loading = true
      fetchPrediction({
        plan: this.activedGame.plans[0].code,
        scheme: this.currentScheme.code
      }).then(res => {
        this.loading = false
        this.predictions = res
        const view = this.$refs.view
        if (isChange || view.scrollTop + view.clientHeight + 100 > view.scrollHeight) {
          this.$nextTick(() => {
            view.scrollTop = view.scrollHeight
          })
        }
      }).catch(() => {
        this.loading = false
      })
    },
    swipe (type, isDisabled) {
      if (isDisabled) {
        return
      }
      if (type === 'prev') {
        this.currentChunk--
      } else {
        this.currentChunk++
      }
    },
    switchGame (currentGame) {
      if (currentGame.actived || this.loading) {
        return
      }
      this.activedGame.actived = false
      currentGame.actived = true
      this.activedGame = currentGame

      this.currentSchemes = currentGame.plans[0].schemes
      this.switchScheme(this.currentSchemes[0])
    },
    switchScheme (currentScheme) {
      if (currentScheme.actived || this.loading) {
        return
      }
      this.currentScheme.actived = false
      this.currentScheme = currentScheme
      this.currentScheme.actived = true
    },
    beforeDestroy () {
      clearTimeout(this.predictionTimer)
      this.predictionTimer = null
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.swiper-container {
  width: 100%;
  height: 45px;
  flex: 0 0 auto;
  background-color: rgba(0, 0, 0, 0.09);
  display: flex;
  color: #fff;
  font-size: 12px;
  .prev, .next {
    flex: 0 0 auto;
    position: relative;
    width: 30px;
    height: 100%;
    &::before{
      position: absolute;
      content: '';
      width: 10px;
      height: 10px;
      border-top: solid 2px #4a4a4a;
      border-left: solid 2px #4a4a4a;
      top: 15px;
    }
    &.disabled{
      &::before{
        border-color: #CCC;
      }
    }
  }
  .prev::before {
    left: 10px;
    transform: rotate(-45deg)
  }
  .next::before {
    right: 10px;
    transform: rotate(135deg)
  }
  .games {
    display: flex;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 10px 0;
    list-style: none;
    .game {
      width: 25%;
      height: 100%;
      box-sizing: border-box;
      padding: 0 5px;
      text-align: center;
      .btn {
        height: 100%;
        line-height: 25px;
        width: 100%;
        border-radius: 4px;
        background: #9b9b9b;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        &.active {
          background: #4a90e2;
        }
      }
    }
  }
}
.wrapper {
  display: flex;
  flex: 1 1 auto;
  background: #fff;
  flex-direction: column;
  .scheme-container {
    flex: 0 0 auto;
    width: 100%;
    background-color: #ffffff;
    box-shadow: 0 2px 4px 0 rgba(156, 156, 156, 0.5);
    color: #9b9b9b;
    font-size: 14px;
    font-weight: 700;
    .schemes {
      width: 100%;
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      .scheme {
        width: 20%;
        height: 40px;
        line-height: 40px;
        text-align: center;
        &.active {
          color: #4a4a4a;
        }
      }
    }
  }
  .prediction-container {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 10px 20px;
    .predictions {
      list-style: none;
      .prediction {
        .content {
          padding-left: 10px;
        }
      }
    }
  }
}

</style>


