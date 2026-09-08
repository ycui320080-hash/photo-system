<script setup lang="ts">
withDefaults(
  defineProps<{
    src: string;
    alt: string;
    ratio?: 'wide' | 'portrait' | 'square';
    label?: string;
  }>(),
  { ratio: 'wide', label: '待替换校园实拍' },
);
</script>

<template>
  <view class="film-image" :class="'ratio-' + ratio">
    <image :src="src" :alt="alt" mode="aspectFill" />
    <text class="replace-label">{{ label }}</text>
  </view>
</template>

<style scoped>
.film-image {
  position: relative;
  overflow: hidden;
  background: #ded8ca;
  border: 7px solid #fffaf2;
  box-shadow: 0 8px 22px rgba(43, 37, 31, 0.13);
}
.ratio-wide { aspect-ratio: 16 / 9; }
.ratio-portrait { aspect-ratio: 4 / 5; }
.ratio-square { aspect-ratio: 1; }
image { width: 100%; height: 100%; }
.replace-label {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 4px 7px;
  background: rgba(37, 35, 31, 0.72);
  border-radius: 4px;
  color: #fff;
  font-size: 9px;
  letter-spacing: 0.5px;
}
</style>