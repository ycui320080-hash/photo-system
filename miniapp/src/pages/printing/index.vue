<script setup lang="ts">
import { computed, ref } from 'vue'
import AppTabbar from '../../components/app-tabbar/Index.vue'
import { printAmount } from '../../../../shared/constants/printing'
import { money } from '../../../../shared/utils/format'
import { submitPrint } from '../../services/printing.service'

const photos = ref<string[]>([])
const sizes = [
  { label: '5寸', value: '5寸', detail: '12.7 × 8.9 cm', price: '¥1.20/张' },
  { label: '6寸', value: '6寸', detail: '15.2 × 10.2 cm', price: '¥1.50/张' },
  { label: '一寸', value: '一寸证件照', detail: '2.5 × 3.5 cm', price: '¥0.80/张' },
  { label: '二寸', value: '二寸证件照', detail: '3.5 × 4.9 cm', price: '¥1.00/张' },
]
const papers = [
  { label: '光面相纸', value: '光面', note: '色彩鲜艳' },
  { label: '绒面相纸', value: '绒面', note: '质感细腻' },
  { label: '复古照片纸', value: '复古', note: '怀旧质感' },
]
const size = ref('5寸')
const paper = ref('光面')
const quantity = ref(10)
const date = ref(new Date(Date.now() + 2 * 86400000).toLocaleDateString('sv-SE'))
const busy = ref(false)
const error = ref('')
const success = ref('')

const amount = computed(() => {
  if (!photos.value.length) return 0
  try {
    return printAmount(size.value, quantity.value, paper.value, false, photos.value.length)
  } catch {
    return 0
  }
})

function choose() {
  uni.chooseImage({
    count: 20,
    sizeType: ['original'],
    success: (result) => {
      photos.value = (result.tempFilePaths as string[]).slice(0, 20)
      error.value = ''
    },
    fail: () => uni.showToast({ title: '未选择照片', icon: 'none' }),
  })
}

function changeQuantity(step: number) {
  quantity.value = Math.max(1, Math.min(100, quantity.value + step))
}

async function submit() {
  if (busy.value) return
  if (!photos.value.length) {
    error.value = '请先上传需要冲印的照片'
    return
  }
  busy.value = true
  error.value = ''
  try {
    const result = await submitPrint(photos.value, {
      size: size.value,
      quantity: String(quantity.value),
      paper: paper.value,
      laminate: 'false',
      pickup: date.value + 'T18:00:00+08:00',
    })
    success.value = result.id
    uni.showToast({ title: '冲印订单已提交', icon: 'success' })
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <view class="printing-page">
    <view class="print-head">
      <view class="nav-title">在线冲印</view>
      <image src="/static/images/printing/printing-hero.jpg" mode="aspectFill" />
      <view class="head-note">把生活的瞬间，变成可以触摸的温度。</view>
    </view>

    <view class="page print-content">
      <view class="upload-box" @click="choose">
        <view class="upload-title">{{ photos.length ? '重新选择照片' : '上传照片' }}</view>
        <view class="muted">支持 JPG / JPEG / PNG，单张不超过 20MB</view>
        <view class="privacy-note">请勿上传身份证、银行卡等敏感照片</view>
      </view>

      <view v-if="photos.length" class="selected-title">已选择 {{ photos.length }} 张照片</view>
      <scroll-view v-if="photos.length" scroll-x class="photo-scroll">
        <view class="photo-row">
          <image v-for="photo in photos" :key="photo" :src="photo" mode="aspectFill" />
          <view class="add-photo" @click.stop="choose">继续添加</view>
        </view>
      </scroll-view>

      <view class="section-title">选择尺寸</view>
      <view class="size-grid">
        <view v-for="item in sizes" :key="item.value" class="option" :class="{ selected: size === item.value }" @click="size = item.value">
          <b>{{ item.label }}</b><text>{{ item.detail }}</text><strong>{{ item.price }}</strong>
        </view>
      </view>

      <view class="section-title">选择相纸</view>
      <view class="paper-grid">
        <view v-for="item in papers" :key="item.value" class="option" :class="{ selected: paper === item.value }" @click="paper = item.value">
          <b>{{ item.label }}</b><text>{{ item.note }}</text>
        </view>
      </view>

      <view class="quantity-row">
        <view><b>冲印数量</b><text>每张照片的份数</text></view>
        <view class="stepper"><button @click="changeQuantity(-1)">−</button><b>{{ quantity }}</b><button @click="changeQuantity(1)">＋</button></view>
      </view>

      <picker mode="date" :value="date" @change="date = $event.detail.value">
        <view class="pickup-row"><b>预计取件时间</b><text>{{ date }} 18:00 后</text></view>
      </picker>

      <view v-if="success" class="success">订单 {{ success }} 已提交，请在订单页查看制作进度。</view>
      <view class="error">{{ error }}</view>
    </view>

    <view class="checkout">
      <view><text>总计</text><b>¥{{ money(amount) }}</b><small>共 {{ photos.length * quantity }} 张照片</small></view>
      <button :loading="busy" :disabled="busy || !photos.length" @click="submit">提交冲印</button>
    </view>
    <AppTabbar active="printing" />
  </view>
</template>

<style scoped lang="scss">
.printing-page { min-height: 100vh; background: #f7f3ea; }
.print-head { position: relative; height: 330rpx; background: #25231f; }
.print-head image { width: 100%; height: 100%; opacity: .84; }
.nav-title { position: absolute; z-index: 2; top: 24rpx; left: 30rpx; padding: 10rpx 18rpx; background: rgba(255,252,246,.92); border-radius: 999rpx; color: #25231f; font-size: 30rpx; font-weight: 800; }
.head-note { position: absolute; right: 26rpx; bottom: 22rpx; left: 26rpx; padding: 18rpx 22rpx; background: rgba(255,252,246,.92); border-radius: 16rpx; color: #514b42; font-size: 25rpx; }
.print-content { padding-top: 20rpx; padding-bottom: 300rpx; }
.upload-box { padding: 54rpx 24rpx; background: #fffcf6; border: 2rpx dashed #cbbfb0; border-radius: 22rpx; text-align: center; }
.upload-title { margin-bottom: 10rpx; color: #b64032; font-size: 32rpx; font-weight: 800; }
.privacy-note { margin-top: 8rpx; color: #9d5b52; font-size: 21rpx; }
.selected-title { margin: 24rpx 0 14rpx; font-weight: 700; }
.photo-scroll { width: 100%; white-space: nowrap; }
.photo-row { display: inline-flex; gap: 14rpx; }
.photo-row image, .add-photo { width: 150rpx; height: 150rpx; border-radius: 14rpx; }
.add-photo { display: flex; align-items: center; justify-content: center; background: #fffcf6; border: 1rpx dashed #cbbfb0; color: #756f65; font-size: 22rpx; }
.section-title { margin: 34rpx 0 16rpx; }
.size-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14rpx; }
.paper-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12rpx; }
.option { display: flex; min-height: 132rpx; padding: 20rpx; flex-direction: column; background: #fffcf6; border: 2rpx solid #e8dfd1; border-radius: 16rpx; }
.option.selected { background: #fbefec; border-color: #b64032; }
.option b { font-size: 28rpx; }
.option text { margin-top: 8rpx; color: #817a71; font-size: 20rpx; }
.option strong { margin-top: 10rpx; color: #b64032; font-size: 24rpx; }
.quantity-row, .pickup-row { display: flex; margin-top: 24rpx; padding: 24rpx; align-items: center; justify-content: space-between; background: #fffcf6; border: 1rpx solid #e8dfd1; border-radius: 18rpx; }
.quantity-row > view:first-child { display: flex; flex-direction: column; gap: 6rpx; }
.quantity-row text, .pickup-row text { color: #756f65; font-size: 22rpx; }
.stepper { display: flex; align-items: center; }
.stepper button { width: 64rpx; min-height: 58rpx; margin: 0; padding: 0; background: #f0ebe3; color: #b64032; line-height: 58rpx; }
.stepper b { width: 70rpx; text-align: center; }
.success { margin-top: 24rpx; padding: 22rpx; background: #e6eee3; border-radius: 16rpx; color: #52644d; }
.checkout { position: fixed; z-index: 45; right: 0; bottom: calc(env(safe-area-inset-bottom) + 72px); left: 0; display: flex; max-width: 430px; min-height: 94px; margin: 0 auto; padding: 18rpx 28rpx; align-items: center; justify-content: space-between; background: #fffcf6; border-top: 1rpx solid #e8dfd1; }
.checkout > view { display: flex; flex-direction: column; }
.checkout text, .checkout small { color: #756f65; font-size: 20rpx; }
.checkout b { color: #b64032; font-size: 38rpx; }
.checkout button { width: 240rpx; margin: 0; }
</style>