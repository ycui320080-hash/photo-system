<script setup lang="ts">
import storeConfig from '../../config/store';
</script>

<template>
  <view class="brand-header">
    <image class="brand-mark" src="/static/images/brand/logo-mark.png" mode="aspectFit" />
    <view class="brand-copy">
      <text class="brand-name">{{ storeConfig.name }}</text>
      <text class="brand-context">安徽工程大学校内</text>
    </view>
  </view>
</template>

<style scoped>
.brand-header {
  width: 100%;
  max-width: 430px;
  min-height: 74px;
  margin: 0 auto;
  padding: calc(env(safe-area-inset-top) + 12px) 112px 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f7f3ea;
}
.brand-mark {
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
}
.brand-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.brand-name {
  overflow: hidden;
  color: #25231f;
  font-family: 'STKaiti', 'KaiTi', 'Songti SC', serif;
  font-size: 21px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.brand-context {
  color: #778872;
  font-size: 11px;
  white-space: nowrap;
}
</style>
