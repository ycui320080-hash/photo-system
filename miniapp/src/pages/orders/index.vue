<script setup lang="ts">
import { computed, ref } from 'vue';
import AppTabbar from '../../components/app-tabbar/Index.vue';
import OrderStatusTag from '../../components/order-status-tag/Index.vue';
import { api } from '../../services/api';
import { useData, go } from '../../composables/useData';
import { statuses } from '../../../../shared/constants/order-status';
import { money, chinaTime } from '../../../../shared/utils/format';

const { data, error, busy, reload } = useData(() => api('/orders'));
const filter = ref('全部');
const expanded = ref('');
const filterOptions = ['全部', ...statuses];
const rows = computed(() => data.value.filter((order: any) => filter.value === '全部' || order.status === filter.value));

async function cancel(id: string) {
  uni.showModal({
    title: '取消预约',
    content: '确认取消这笔预约？',
    success: async (result) => {
      if (!result.confirm) return;
      try {
        await api('/orders/' + id + '/cancel', 'POST', {});
        uni.showToast({ title: '预约已取消' });
        await reload();
      } catch (e) {
        uni.showToast({ title: (e as Error).message, icon: 'none' });
      }
    },
  });
}
</script>

<template>
  <view class="page order-page">
    <view class="page-head">
      <view><view class="eyebrow">MY ORDERS</view><view class="title">我的订单</view><view class="subtitle">从预约到取件，每一步都清楚。</view></view>
      <button class="refresh-button" @click="reload">刷新</button>
    </view>

    <scroll-view class="status-scroll" scroll-x>
      <view class="status-row">
        <view v-for="item in filterOptions" :key="item" class="filter-chip" :class="{ active: filter === item }" @click="filter = item">{{ item }}</view>
      </view>
    </scroll-view>

    <view v-if="busy" class="loading-card">正在整理订单…</view>
    <view class="error">{{ error }}</view>

    <view v-for="order in rows" :key="order.id" class="order-card">
      <view class="order-top">
        <view><view class="order-no">订单 {{ order.id }}</view><view class="order-name">{{ order.packageName }}</view></view>
        <OrderStatusTag :status="order.status" />
      </view>
      <view class="order-meta">
        <view><text>下单时间</text><b>{{ chinaTime(order.createdAt) }}</b></view>
        <view><text>预约 / 取件时间</text><b>{{ chinaTime(order.appointment) }}</b></view>
      </view>
      <view class="progress-line">
        <view class="progress-dot active" /><view class="progress-track active" /><view class="progress-dot active" /><view class="progress-track" /><view class="progress-dot" />
      </view>
      <view class="payment-row">
        <view><text class="muted">{{ order.paid ? '实付金额' : '待付金额' }}</text><view class="price">¥{{ money(order.paid || order.amount) }}</view></view>
        <view class="pickup-code"><text>取件码</text><b>{{ order.pickupCode }}</b></view>
      </view>
      <button class="detail-button" @click="expanded = expanded === order.id ? '' : order.id">{{ expanded === order.id ? '收起详情' : '查看详情' }}</button>

      <view v-if="expanded === order.id" class="timeline">
        <view class="timeline-title">订单进度</view>
        <view v-for="(history, index) in order.history" :key="index" class="timeline-item">
          <view class="timeline-dot" />
          <view><b>{{ history.status }}</b><text>{{ chinaTime(history.at) }}</text></view>
        </view>
        <view class="amount-note">已收 ¥{{ money(order.paid) }} · 待付 ¥{{ money(order.amount - order.paid) }}</view>
      </view>

      <view class="action-row">
        <button v-if="order.status === '待选片'" @click="go('photo-selection?id=' + order.id)">去选片</button>
        <button v-if="order.delivery?.length" @click="go('delivery?id=' + order.id)">查看成片</button>
        <button v-if="['待确认', '待到店'].includes(order.status)" class="ghost-button" @click="cancel(order.id)">取消预约</button>
      </view>
    </view>

    <view v-if="!busy && !rows.length" class="empty-card">
      <view class="empty-icon"><view /></view>
      <view class="section-title">这里还没有订单</view>
      <view class="muted">去预约第一张校园照片吧。</view>
      <button @click="go('packages')">看看毕业季套餐</button>
    </view>
    <view class="mock-note">Mock 演示订单 · 不包含真实顾客资料</view>
  </view>
  <AppTabbar active="orders" />
</template>

<style scoped lang="scss">
.refresh-button { min-height: 34px; margin: 0; padding: 0 14px; background: transparent; border: 1px solid #d6c8b7; color: #6a6259; line-height: 34px; }
.status-scroll { margin-bottom: 18px; white-space: nowrap; }
.status-row { display: inline-flex; gap: 8px; }
.filter-chip { padding: 8px 14px; background: #fffcf6; border: 1px solid #e8dfd1; border-radius: 999px; color: #736d65; font-size: 12px; }
.filter-chip.active { background: #b64032; border-color: #b64032; color: #fff; font-weight: 700; }
.loading-card { padding: 20px; background: #fffcf6; border-radius: 16px; text-align: center; }
.order-card { margin-bottom: 15px; padding: 20px; background: #fffcf6; border: 1px solid #e8dfd1; border-radius: 18px; box-shadow: 0 7px 22px rgba(67,54,41,.07); }
.order-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.order-no { color: #8a8379; font-family: monospace; font-size: 10px; }
.order-name { margin-top: 5px; font-size: 18px; font-weight: 800; }
.order-meta { display: grid; margin-top: 17px; padding: 13px; grid-template-columns: repeat(2,1fr); gap: 12px; background: #f6f1e8; border-radius: 11px; }
.order-meta text { display: block; color: #878077; font-size: 10px; }
.order-meta b { display: block; margin-top: 4px; font-size: 12px; }
.progress-line { display: flex; margin: 20px 8px 17px; align-items: center; }
.progress-dot { width: 8px; height: 8px; background: #d9d2c8; border-radius: 50%; }
.progress-dot.active { background: #b64032; box-shadow: 0 0 0 4px #f5e4e0; }
.progress-track { height: 2px; flex: 1; background: #ddd6cb; }
.progress-track.active { background: #b64032; }
.payment-row { display: flex; align-items: flex-end; justify-content: space-between; }
.pickup-code { min-width: 104px; padding: 9px 14px; background: #25231f; border-radius: 10px; color: #fff; text-align: center; }
.pickup-code text { display: block; color: #c9c1b6; font-size: 9px; letter-spacing: 2px; }
.pickup-code b { display: block; margin-top: 2px; color: #efc650; font-family: monospace; font-size: 24px; letter-spacing: 3px; }
.detail-button { width: 100%; margin-top: 16px; background: #f3e8df; color: #a6392e; }
.timeline { margin-top: 14px; padding: 16px; background: #f6f1e8; border-radius: 12px; }
.timeline-title { margin-bottom: 12px; font-weight: 800; }
.timeline-item { position: relative; display: flex; min-height: 45px; gap: 12px; }
.timeline-item:not(:last-of-type)::before { position: absolute; top: 10px; bottom: -4px; left: 4px; width: 1px; background: #cfc5b7; content: ''; }
.timeline-dot { z-index: 1; width: 9px; height: 9px; margin-top: 4px; background: #778872; border-radius: 50%; }
.timeline-item b,.timeline-item text { display: block; font-size: 11px; }
.timeline-item text { margin-top: 3px; color: #888178; }
.amount-note { padding-top: 10px; border-top: 1px solid #ded5c9; font-size: 12px; }
.action-row { display: flex; flex-wrap: wrap; gap: 8px; }
.action-row button { margin-top: 12px; }
.empty-card { display: flex; min-height: 280px; padding: 30px; align-items: center; justify-content: center; flex-direction: column; background: #fffcf6; border: 1px dashed #d5c9ba; border-radius: 18px; text-align: center; }
.empty-icon { position: relative; width: 70px; height: 54px; margin-bottom: 20px; border: 2px solid #778872; border-radius: 9px; }
.empty-icon::before { position: absolute; top: -9px; left: 15px; width: 35px; height: 9px; background: #778872; border-radius: 5px 5px 0 0; content: ''; }
.empty-icon view { width: 20px; height: 20px; margin: 15px auto; border: 2px solid #778872; border-radius: 50%; }
</style>