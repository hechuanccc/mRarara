<template>
<div>
  <group>
    <cell-box>
      <div class="display-area">
        <div v-if="showImg" class="current-img" :style="{'background-image': `url('${showImg}')`}"></div>
        <div v-else class="default-img"></div>
        <div v-if="showImg" class="reset-img" @click="resetImg">恢复预设头像</div>
      </div>
    </cell-box>
    <div v-if="inputErrors.length">
      <ul class="input-errors">
        <li class="text" v-for="(error, index) in inputErrors" :key="index">
          {{error}}
        </li>
      </ul>
    </div>
    <cell-box>
      <label class="setting-img">
        <span class="cross"></span>
        <input
          ref="fileImgSend"
          style="display:none"
          type="file"
          accept="image/*"
          @change="syncImg($event)">
      </label>
    </cell-box>
  </group>
  <div class="text-center text-danger m-t">{{errorMsg}}</div>
  <div class="text-center text-success m-t" v-if="changed">头像已修改</div>
  <div class="m-a">
    <x-button type="primary" :disabled="!hasChange" @click.native="submit">
      <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
      <span v-else>提交</span>
    </x-button>
  </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Group, GroupTitle, CellBox, Cell, XButton, Spinner } from 'vux'
import { changeUserInfo } from '../../api'
import { msgFormatter } from '../../utils'
import lrz from 'lrz'
export default {
  name: 'ImageEditor',
  components: {
    Group,
    CellBox,
    Cell,
    GroupTitle,
    XButton,
    Spinner
  },
  data () {
    const avatar = this.$store.state.user.avatar
    const showImg = avatar || ''
    return {
      selectedImg: '',
      showImg,
      originImg: showImg,
      loading: false,
      inputErrors: [],
      errorMsg: '',
      changed: false
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ]),
    hasChange () {
      return this.originImg !== this.showImg
    }
  },
  methods: {
    syncImg (e) {
      const file = e.target.files[0]
      lrz(file).then(rst => {
        const inputErrors = []
        if (rst.fileLen > 1024 * 1024) {
          inputErrors.push('图片过大，请选择较小的图片')
        }
        this.inputErrors = inputErrors
        this.showImg = URL.createObjectURL(rst.file)
        this.selectedImg = rst
      })
    },
    submit () {
      if (this.loading) {
        return
      }
      let formData
      if (!this.selectedImg) {
        formData = {avatar: ''}
      } else {
        const inputErrors = []
        if (this.selectedImg.file.size > 1024 * 1024) {
          inputErrors.push('图片过大，请选择较小的图片')
          this.inputErrors = inputErrors
          return
        } else {
          formData = new FormData()
          formData.append('avatar', this.selectedImg.file, this.selectedImg.origin.name)
        }
      }
      this.loading = true
      changeUserInfo(this.$store.state.user.id, formData).then((response) => {
        this.changed = true
        setTimeout(() => {
          this.loading = false
          this.$store.dispatch('fetchUser').then(() => {
            this.$router.push({path: '/'})
          })
        }, 2000)
      }, (response) => {
        this.loading = false
        this.errorMsg = msgFormatter(response)
      })
    },
    resetImg () {
      this.showImg = ''
      this.selectedImg = ''
      this.$refs.fileImgSend.value = ''
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../styles/vars.less';
.display-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  .reset-img {
    display: block;
    text-align: center;
    color: @red;
    height: 40px;
    line-height: 40px;
  }
}
.default-img,.current-img {
  width: 100%;
  height: 200px;
  display: flex;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center center;
  justify-content: center;
  align-items: center;
}
.default-img {
  background-image: url('../../assets/avatar.png')
}
.setting-img {
  margin: 20px auto;
  border: 1px dotted #000;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  .cross {
    position: relative;
  }
  .cross:before, .cross:after {
    position: absolute;
    top: -15px;
    content: ' ';
    height: 40px;
    width: 2px;
    background-color: #bfbfbf;
  }
  .cross:after {
    transform: rotate(90deg);
  }
}

</style>


