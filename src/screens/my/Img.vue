<template>
<div>
  <group>
    <cell-box>
      <div v-if="showImg" class="current-img" :style="showImg"></div>
      <div v-else class="current-img">暂无图片</div>
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
        <input style="display:none" type="file" accept="image/*" @change="syncImg($event)">
      </label>
    </cell-box>
  </group>
  <div class="text-center text-danger m-t">{{errorMsg}}</div>
  <div class="text-center text-success m-t" v-if="changed">头像已修改</div>
  <div class="m-a">
    <x-button type="primary" @click.native="submit">
      <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
      <span v-else>提交</span>
    </x-button>
  </div>
</div>
</template>

<script>
import { Group, GroupTitle, CellBox, XButton, Spinner } from 'vux'
import { changeUserInfo } from '../../api'
import { msgFormatter } from '../../utils'
export default {
  name: 'ImageEditor',
  components: {
    Group,
    CellBox,
    GroupTitle,
    XButton,
    Spinner
  },
  data () {
    const avatar = this.$store.state.user.avatar
    const showImg = avatar ? {'background-image': `url(${avatar})`} : ''
    return {
      selectedImg: '',
      showImg,
      loading: false,
      inputErrors: [],
      errorMsg: '',
      changed: false
    }
  },
  methods: {
    syncImg (e) {
      const reader = new FileReader()
      const file = e.target.files[0]
      const inputErrors = []
      if (file.size > 1024 * 1024) {
        inputErrors.push('图片过大，请选择较小的图片')
      }
      this.inputErrors = inputErrors

      reader.onload = (e) => {
        this.showImg = {'background-image': `url(${e.target.result})`}
      }
      reader.readAsDataURL(file)
      this.selectedImg = file
    },
    submit () {
      if (this.loading) {
        return
      }
      const inputErrors = []
      if (!this.selectedImg) {
        inputErrors.push('请选择头像')
      } else if (this.selectedImg.size > 1024 * 1024) {
        inputErrors.push('图片过大，请选择较小的图片')
      }
      this.inputErrors = inputErrors
      if (inputErrors.length === 0) {
        this.loading = true
        let formData = new window.FormData()
        formData.append('avatar', this.selectedImg)
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
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.current-img {
  width: 100%;
  height: 200px;
  display: flex;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center center;
  justify-content: center;
  align-items: center;
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


