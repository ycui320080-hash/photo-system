<script setup lang="ts">
import storeConfig from '../../config/store';
</script>

<template>
  <view class="brand-header">
    <image class="brand-mark" src="/static/images/brand/logo-mark.png" mode="aspectFit" />
    <view class="brand-copy">
      <text class="brand-name">{{ storeConfig.name }}</text>
      <text class="brand-context">安徽工程大学校内摄影服务</text>
    </view>
  </view>
</template>

<style scoped>
.brand-header {
  display: flex;
  width: 100%;
  max-width: 430px;
  height: calc(68px + env(safe-area-inset-top));
  margin: 0 auto;
  padding: env(safe-area-inset-top) 112px 0 16px;
  box-sizing: border-box;
  align-items: center;
  gap: 9px;
  background: #f7f3ea;
}
.brand-mark {
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
}
.brand-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}
.brand-name,
.brand-context {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.brand-name {
  color: #25231f;
  font-family: 'STKaiti', 'KaiTi', 'Songti SC', serif;
  font-size: 19px;
  font-weight: 800;
  line-height: 1.2;
}
.brand-context {
  color: #778872;
  font-size: 10px;
  line-height: 1.35;
}
</style>
