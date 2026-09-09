<script setup lang="ts">
import storeConfig from '../../config/store';
</script>

<template>
  <view class="brand-header">
    <image class="brand-mark" src="/static/images/brand/logo-glyph.png" mode="aspectFit" />
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
  gap: 10px;
  background: #f7f3ea;
}
.brand-mark {
  width: 46px;
  height: 40px;
  flex: 0 0 auto;
}
.brand-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
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
  font-family: 'STSong', 'Songti SC', 'SimSun', serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}
.brand-context {
  color: #9a9284;
  font-size: 10px;
  letter-spacing: 0.5px;
  line-height: 1.35;
}
</style>
