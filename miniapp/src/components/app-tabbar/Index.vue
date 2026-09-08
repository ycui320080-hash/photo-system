<script setup lang="ts">
const props = defineProps<{ active: 'home' | 'printing' | 'packages' | 'orders' | 'profile' }>();

const items = [
  { key: 'home', label: '首页', url: '/pages/home/index' },
  { key: 'printing', label: '冲印', url: '/pages/printing/index' },
  { key: 'packages', label: '套餐', url: '/pages/packages/index' },
  { key: 'orders', label: '订单', url: '/pages/orders/index' },
  { key: 'profile', label: '我的', url: '/pages/profile/index' },
] as const;

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
      <view class="line-icon" :class="'icon-' + item.key"><view /></view>
      <text>{{ item.label }}</text>
    </view>
  </view>
</template>

<style scoped>
.tabbar {
  position: fixed;
  z-index: 50;
  right: 0;
  bottom: 0;
  left: 0;
  display: grid;
  height: calc(env(safe-area-inset-bottom) + 72px);
  padding: 9px max(10px, calc((100vw - 620px) / 2)) env(safe-area-inset-bottom);
  grid-template-columns: repeat(5, 1fr);
  background: rgba(255, 252, 246, 0.97);
  border-top: 1px solid #e8dfd1;
}
.tab-item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 4px;
  color: #89847b;
  font-size: 11px;
}
.tab-item.active { color: #b64032; font-weight: 700; }
.line-icon {
  position: relative;
  width: 22px;
  height: 22px;
  border: 1.7px solid currentColor;
  border-radius: 7px;
}
.icon-home { border-radius: 4px 4px 7px 7px; transform: rotate(45deg) scale(0.7); }
.icon-home view { width: 7px; height: 7px; margin: 10px 0 0 10px; background: currentColor; }
.icon-printing::before,
.icon-packages::before,
.icon-orders::before,
.icon-profile::before { position: absolute; content: ''; }
.icon-printing::before { inset: 5px 3px; border-top: 2px solid currentColor; border-bottom: 2px solid currentColor; }
.icon-packages::before { top: 5px; right: 5px; bottom: 5px; left: 5px; border: 1.5px solid currentColor; transform: rotate(45deg); }
.icon-orders::before { inset: 5px 4px; border-top: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor; }
.icon-profile { border-radius: 50%; }
.icon-profile::before { width: 7px; height: 7px; top: 3px; left: 6px; border: 1.5px solid currentColor; border-radius: 50%; }
.icon-profile view { position: absolute; right: 3px; bottom: 3px; left: 3px; height: 6px; border: 1.5px solid currentColor; border-radius: 8px 8px 3px 3px; }
</style>