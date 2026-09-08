<script setup lang="ts">
const props = defineProps<{ active: 'home' | 'printing' | 'packages' | 'orders' | 'profile' }>()

const items = [
  { key: 'home', label: '首页', url: '/pages/home/index', icon: '/static/images/brand/logo-mark.png' },
  { key: 'printing', label: '冲印', url: '/pages/printing/index', icon: '/static/images/printing/printing-hero.jpg' },
  { key: 'packages', label: '套餐', url: '/pages/packages/index', icon: '/static/images/camp/campus-hero.jpg' },
  { key: 'orders', label: '订单', url: '/pages/orders/index', icon: '/static/images/id-photo/id-photo-sample.jpg' },
  { key: 'profile', label: '我的', url: '/pages/profile/index', icon: '/static/images/brand/logo-mark.png' },
] as const

function switchPage(url: string, key: string) {
  if (key === props.active) return
  uni.reLaunch({ url })
}
</script>

<template>
  <view class="tabbar">
    <view v-for="item in items" :key="item.key" class="tab-item" :class="{ active: active === item.key }" @click="switchPage(item.url, item.key)">
      <image class="tab-icon" :src="item.icon" mode="aspectFill" />
      <text>{{ item.label }}</text>
    </view>
  </view>
</template>

<style scoped>
.tabbar { position: fixed; z-index: 50; right: 0; bottom: 0; left: 0; display: grid; height: calc(env(safe-area-inset-bottom) + 72px); padding: 9px max(10px, calc((100vw - 430px) / 2)) env(safe-area-inset-bottom); grid-template-columns: repeat(5, 1fr); background: rgba(255,252,246,.98); border-top: 1px solid #e8dfd1; }
.tab-item { display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 4px; color: #807b73; font-size: 11px; }
.tab-item.active { color: #b64032; font-weight: 700; }
.tab-icon { width: 25px; height: 25px; border: 1px solid #ded5c8; border-radius: 8px; filter: grayscale(1); opacity: .72; }
.tab-item.active .tab-icon { border-color: #b64032; filter: none; opacity: 1; }
</style>