<script setup lang="ts">
const props = defineProps<{ active: 'home' | 'printing' | 'packages' | 'orders' | 'profile' }>();

const items = [
  { key: 'home', label: '首页', url: '/pages/home/index', icon: 'home' },
  { key: 'printing', label: '冲印', url: '/pages/printing/index', icon: 'print' },
  { key: 'packages', label: '套餐', url: '/pages/packages/index', icon: 'collection' },
  { key: 'orders', label: '订单', url: '/pages/orders/index', icon: 'receipt' },
  { key: 'profile', label: '我的', url: '/pages/profile/index', icon: 'user' },
] as const;

const iconPath = (icon: string, key: string) =>
  '/static/icons/line/' + icon + (props.active === key ? '-active' : '') + '.svg';

function switchPage(url: string, key: string) {
  if (key === props.active) return;
  uni.reLaunch({ url });
}
</script>

<template>
  <view class="tabbar">
    <view
      v-for="item in items"
      :key="item.key"
      class="tab-item"
      :class="{ active: active === item.key }"
      @click="switchPage(item.url, item.key)"
    >
      <image class="tab-icon" :src="iconPath(item.icon, item.key)" mode="aspectFit" />
      <text>{{ item.label }}</text>
    </view>
  </view>
</template>

<style scoped>
.tabbar {
  position: fixed;
  z-index: 50;
  bottom: 0;
  left: 50%;
  display: grid;
  width: 100%;
  max-width: 430px;
  height: calc(64px + env(safe-area-inset-bottom));
  padding: 7px 10px env(safe-area-inset-bottom);
  box-sizing: border-box;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  background: rgba(255, 252, 246, 0.98);
  border-top: 1px solid #e8dfd1;
  transform: translateX(-50%);
}
.tab-item {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 3px;
  color: #666b65;
  font-size: 11px;
  line-height: 1;
}
.tab-item:active {
  opacity: 0.7;
}
.tab-item.active {
  color: #b64032;
  font-weight: 700;
}
.tab-icon {
  width: 22px;
  height: 22px;
}
</style>
