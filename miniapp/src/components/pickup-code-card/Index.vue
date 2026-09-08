<script setup lang="ts">
import storeConfig from '../../config/store'

const props = defineProps<{ code?: string }>()

function copyCode() {
  if (!props.code) return
  uni.setClipboardData({ data: props.code, success: () => uni.showToast({ title: '取件码已复制' }) })
}
</script>

<template>
  <view class="pickup-card">
    <view class="pickup-head"><b>取件码</b><text>向店员出示取件</text></view>
    <view v-if="code" class="code-row" @click="copyCode"><text>{{ code }}</text><button>复制</button></view>
    <view v-else class="pending">照片制作完成后生成取件码。</view>
    <view class="pickup-tip">请到{{ storeConfig.address }}，向店员出示取件码取件。</view>
  </view>
</template>

<style scoped>
.pickup-card{padding:28rpx;background:#fffcf6;border:1rpx solid #e8dfd1;border-radius:24rpx}.pickup-head{display:flex;align-items:center;justify-content:space-between}.pickup-head b{font-size:30rpx}.pickup-head text{color:#8c857b;font-size:22rpx}.code-row{display:flex;margin:22rpx 0;align-items:center;justify-content:space-between;gap:20rpx}.code-row>text{flex:1;padding:26rpx 20rpx;background:#f7e8e2;border-radius:16rpx;color:#a9362d;font-family:monospace;font-size:44rpx;font-weight:700;letter-spacing:5rpx;text-align:center}.code-row button{width:104rpx;min-height:72rpx;margin:0;padding:0;background:#fff;border:1rpx solid #d9cfc2;color:#25231f;font-size:24rpx;line-height:72rpx}.pending{margin:22rpx 0;padding:24rpx;background:#f2eee7;border-radius:14rpx;color:#756f65}.pickup-tip{color:#756f65;font-size:23rpx;line-height:1.6}
</style>
