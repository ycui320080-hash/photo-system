<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ status: string }>()

const steps = ['已预约', '已拍摄', '修图中', '待取件']
const statusIndex: Record<string, number> = {
  待确认: 0,
  待到店: 0,
  已拍摄: 1,
  待上传预览图: 1,
  待选片: 1,
  修图中: 2,
  待顾客确认: 2,
  待打印: 2,
  待取件: 3,
  已完成: 3,
}
const active = computed(() => statusIndex[props.status] ?? 0)
</script>

<template>
  <view class="progress">
    <view v-for="(step, index) in steps" :key="step" class="progress-step">
      <view class="step-row">
        <view class="step-dot" :class="{ active: index <= active }">{{ index + 1 }}</view>
        <view v-if="index < steps.length - 1" class="step-line" :class="{ active: index < active }" />
      </view>
      <text :class="{ active: index <= active }">{{ step }}</text>
    </view>
  </view>
</template>

<style scoped>
.progress{display:flex;margin:28rpx 0 34rpx}.progress-step{min-width:0;flex:1;color:#9a958d;font-size:22rpx;text-align:center}.step-row{display:flex;align-items:center}.step-dot{display:flex;width:50rpx;height:50rpx;align-items:center;justify-content:center;flex:0 0 auto;background:#e8e3da;border-radius:50%;color:#79746d;font-weight:700}.step-dot.active{background:#778872;color:#fff}.step-line{height:3rpx;flex:1;background:#ddd7cd}.step-line.active{background:#778872}.progress-step text{display:block;margin-top:10rpx}.progress-step text.active{color:#25231f;font-weight:600}
</style>
