<script setup lang="ts">
import { computed, ref } from 'vue'
import AppTabbar from '../../components/app-tabbar/Index.vue'
import OrderStatusTag from '../../components/order-status-tag/Index.vue'
import { api } from '../../services/api'
import { useData, go } from '../../composables/useData'
import { money, chinaTime } from '../../../../shared/utils/format'

const { data, error, busy, reload } = useData(() => api('/orders'))
const filter = ref('全部')
const filterOptions = ['全部', '待确认', '已拍摄', '修图中', '待取件', '已完成']
const rows = computed(() => data.value.filter((order: any) => filter.value === '全部' || order.status === filter.value))

async function cancel(id: string) {
  uni.showModal({
    title: '取消预约',
    content: '确认取消这笔预约？',
    success: async (result) => {
      if (!result.confirm) return
      try {
        await api('/orders/' + id + '/cancel', 'POST', {})
        uni.showToast({ title: '预约已取消' })
        await reload()
      } catch (e) {
        uni.showToast({ title: (e as Error).message, icon: 'none' })
      }
    },
  })
}
</script>

<template>
  <view class="page orders-page">
    <view class="page-head">
      <view>
        <view class="title">我的订单</view>
        <view class="subtitle">从预约到取件，每一步都清晰。</view>
      </view>
      <button class="refresh" @click="reload">刷新</button>
    </view>

    <scroll-view class="filter-scroll" scroll-x>
      <view class="filter-row">
        <view v-for="item in filterOptions" :key="item" class="filter" :class="{ active: filter === item }" @click="filter = item">{{ item }}</view>
      </view>
    </scroll-view>

    <view v-if="busy" class="state-card">正在整理订单…</view>
    <view class="error">{{ error }}</view>

    <view v-for="order in rows" :key="order.id" class="order-card">
      <view class="order-top">
        <view><text>订单 {{ order.id }}</text><b>{{ order.packageName }}</b></view>
        <OrderStatusTag :status="order.status" />
      </view>
      <view class="order-info">
        <view><text>预约 / 取件时间</text><b>{{ chinaTime(order.appointment) }}</b></view>
        <view><text>订单金额</text><b class="amount">¥{{ money(order.amount) }}</b></view>
      </view>
      <view v-if="order.pickupCode && ['待取件', '已完成'].includes(order.status)" class="pickup"><text>取件码</text><b>{{ order.pickupCode }}</b></view>
      <view class="actions">
        <button class="detail" @click="go('order-detail?id=' + order.id)">查看详情</button>
        <button v-if="order.status === '待选片'" class="secondary" @click="go('photo-selection?id=' + order.id)">去选片</button>
        <button v-if="['待确认', '待到店'].includes(order.status)" class="ghost-button" @click="cancel(order.id)">取消预约</button>
      </view>
    </view>

    <view v-if="!busy && !rows.length" class="empty-card">
      <image src="/static/images/brand/logo-mark.png" mode="aspectFit" />
      <view class="section-title">这里还没有订单</view>
      <view class="muted">预约一组校园照片，留下属于你的大学时光。</view>
      <button @click="go('packages')">查看拍摄套餐</button>
    </view>
    <AppTabbar active="orders" />
  </view>
</template>

<style scoped lang="scss">
.orders-page { padding-top: calc(env(safe-area-inset-top) + 30rpx); }
.refresh { min-height: 64rpx; margin: 0; padding: 0 24rpx; background: #fffcf6; border: 1rpx solid #e8dfd1; color: #25231f; line-height: 64rpx; }
.filter-scroll { margin-bottom: 24rpx; white-space: nowrap; }
.filter-row { display: inline-flex; gap: 12rpx; }
.filter { padding: 14rpx 24rpx; background: #fffcf6; border: 1rpx solid #e8dfd1; border-radius: 999rpx; color: #756f65; font-size: 22rpx; }
.filter.active { background: #b64032; border-color: #b64032; color: #fff; }
.state-card { padding: 38rpx; background: #fffcf6; border-radius: 20rpx; text-align: center; }
.order-card { margin-bottom: 22rpx; padding: 26rpx; background: #fffcf6; border: 1rpx solid #e8dfd1; border-radius: 24rpx;} 
.order-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 18rpx; }
.order-top text, .order-top b { display: block; }
.order-top text { color: #8a8379; font-family: monospace; font-size: 20rpx; }
.order-top b { margin-top: 8rpx; font-size: 30rpx; }
.order-info { display: grid; margin-top: 24rpx; padding: 20rpx; grid-template-columns: 1fr 1fr; gap: 18rpx; background: #f6f1e8; border-radius: 16rpx; }
.order-info text, .order-info b { display: block; }
.order-info text { color: #878077; font-size: 20rpx; }
.order-info b { margin-top: 6rpx; font-size: 22rpx; }
.order-info .amount { color: #b64032; font-size: 28rpx; }
.pickup { display: flex; margin-top: 18rpx; padding: 18rpx 22rpx; align-items: center; justify-content: space-between; background: #25231f; border-radius: 16rpx; color: #fff; }
.pickup text { color: #d5cec3; font-size: 22rpx; }
.pickup b { color: #efc650; font-family: monospace; font-size: 34rpx; letter-spacing: 4rpx; }
.actions { display: flex; margin-top: 20rpx; flex-wrap: wrap; gap: 12rpx; }
.actions button { min-height: 72rpx; margin: 0; padding: 0 24rpx; flex: 1; line-height: 72rpx; }
.empty-card { padding: 68rpx 30rpx; background: #fffcf6; border: 1rpx solid #e8dfd1; border-radius: 24rpx; text-align: center; }
.empty-card image { width: 120rpx; height: 120rpx; margin-bottom: 18rpx; }
.empty-card button { width: 260rpx; margin: 24rpx auto 0; }
</style>