<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import OrderProgress from '../../components/order-progress/Index.vue'
import PickupCodeCard from '../../components/pickup-code-card/Index.vue'
import storeConfig from '../../config/store'
import { api } from '../../services/api'
import { go } from '../../composables/useData'
import { chinaTime, money } from '../../../../shared/utils/format'

const order = ref<any>(null)
const busy = ref(true)
const error = ref('')
const appointment = computed(() => order.value?.appointment ? chinaTime(order.value.appointment) : '待确认')
const readyForPickup = computed(() => ['待取件', '已完成'].includes(order.value?.status))

onLoad(async (query) => {
  try {
    order.value = await api('/orders/' + query?.id)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
})

function contact() {
  if (storeConfig.phone) uni.makePhoneCall({ phoneNumber: storeConfig.phone })
  else uni.showToast({ title: '门店暂未设置联系电话', icon: 'none' })
}
</script>

<template>
  <view class="page detail-page">
    <view v-if="busy" class="state-card">正在加载订单详情…</view>
    <view v-else-if="error" class="state-card error">{{ error }}</view>
    <template v-else-if="order">
      <view class="order-hero">
        <image src="/static/images/id-photo/id-photo-sample.jpg" mode="aspectFill" />
        <view><text class="order-label">{{ order.status }}</text><view class="title">{{ order.packageName }}</view><view class="subtitle">订单 {{ order.id }}</view></view>
      </view>

      <OrderProgress :status="order.status" />

      <view class="info-card">
        <view class="card-title">预约信息</view>
        <view class="info-row"><text>拍摄时间</text><b>{{ appointment }}</b></view>
        <view class="info-row"><text>拍摄地点</text><b>{{ storeConfig.address }}</b></view>
        <view class="info-row"><text>服务场景</text><b>{{ storeConfig.scene }}</b></view>
      </view>

      <view class="info-card">
        <view class="card-title">支付信息</view>
        <view class="info-row"><text>支付方式</text><b>{{ order.paid ? '到店支付' : '待支付' }}</b></view>
        <view class="info-row"><text>订单金额</text><b class="amount">¥{{ money(order.amount) }}</b></view>
        <view class="info-row"><text>支付状态</text><b>{{ order.paid ? '已支付' : '未支付' }}</b></view>
      </view>

      <PickupCodeCard :code="readyForPickup ? order.pickupCode : undefined" />

      <view class="actions">
        <button v-if="order.delivery?.length" class="secondary" @click="go('delivery?id=' + order.id)">查看成片</button>
        <button class="contact" @click="contact">联系商家</button>
      </view>
    </template>
  </view>
</template>

<style scoped lang="scss">
.detail-page{padding-bottom:calc(env(safe-area-inset-bottom) + 38px)}.state-card{padding:48rpx 30rpx;background:#fffcf6;border:1rpx solid #e8dfd1;border-radius:24rpx;text-align:center}.order-hero{display:flex;padding:26rpx;align-items:center;gap:26rpx;background:#efe4d4;border-radius:24rpx}.order-hero image{width:142rpx;height:176rpx;flex:0 0 auto;border:10rpx solid #fff;box-shadow:0 8rpx 20rpx rgba(60,47,34,.14);transform:rotate(-3deg)}.order-hero .title{font-size:38rpx}.order-label{display:inline-block;padding:7rpx 14rpx;background:#b64032;border-radius:8rpx;color:#fff;font-size:22rpx}.info-card{margin-bottom:22rpx;padding:28rpx;background:#fffcf6;border:1rpx solid #e8dfd1;border-radius:24rpx}.card-title{margin-bottom:20rpx;font-size:30rpx;font-weight:700}.info-row{display:flex;padding:12rpx 0;justify-content:space-between;gap:28rpx;color:#756f65;font-size:24rpx}.info-row b{color:#393631;text-align:right}.info-row .amount{color:#b64032;font-size:30rpx}.actions{display:grid;margin-top:22rpx;grid-template-columns:1fr 1fr;gap:16rpx}.actions button{margin:0}.contact{background:#fff;border:1rpx solid #b64032;color:#b64032}
</style>
