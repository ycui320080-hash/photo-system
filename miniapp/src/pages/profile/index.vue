<script setup lang="ts">
import { ref } from 'vue';
import AppTabbar from '../../components/app-tabbar/Index.vue';
import ContactEditor from '../../components/ContactEditor.vue';
import { useData, go } from '../../composables/useData';
import { api } from '../../services/api';

const { data, error } = useData(() => api('/settings'), {});
const { data: profile } = useData(() => api('/profile'), {});
const cloudMode = import.meta.env.VITE_MODE === 'cloudbase';
const policy = ref('');

const entries = [
  { label: '我的订单', note: '查看制作进度', action: 'orders' },
  { label: '我的预约', note: '到店时间安排', action: 'orders' },
  { label: '我的电子相册', note: '查看已交付成片', action: 'orders' },
  { label: '我的优惠券', note: '暂无可用优惠券', action: 'coupon' },
  { label: '常用联系人', note: '管理预约联系人', action: 'contacts' },
  { label: '联系商家', note: '营业时间内联系', action: 'phone' },
  { label: '意见反馈', note: '告诉我们你的建议', action: 'feedback' },
  { label: '隐私与账号安全', note: '查看隐私说明', action: 'privacy' },
  { label: '关于我们', note: '认识校园照相馆', action: 'about' },
];

function handleEntry(action: string) {
  if (action === 'orders') {
    uni.reLaunch({ url: '/pages/orders/index' });
  } else if (action === 'phone') {
    if (data.value.phone) uni.makePhoneCall({ phoneNumber: data.value.phone });
    else uni.showToast({ title: '门店暂未设置联系电话', icon: 'none' });
  } else if (action === 'privacy') {
    policy.value = '本演示系统仅用于本机测试，请勿输入真实个人资料。正式上线前须补充运营主体、处理目的与保存期限。';
  } else if (action === 'about') {
    policy.value = '安工程校园照相馆是面向校园生活的照相馆经营演示系统，不代表安徽工程大学官方。';
  } else if (action === 'contacts') {
    uni.pageScrollTo({ selector: '#contacts', duration: 250 });
  } else {
    uni.showToast({ title: action === 'coupon' ? '暂无可用优惠券' : '反馈功能开发中', icon: 'none' });
  }
}

function navigate() {
  if (!Number.isFinite(data.value.latitude) || !Number.isFinite(data.value.longitude)) {
    uni.showToast({ title: '门店尚未设置地图位置', icon: 'none' });
    return;
  }
  uni.openLocation({
    latitude: data.value.latitude,
    longitude: data.value.longitude,
    name: data.value.name,
    address: data.value.address,
    fail: () => uni.showToast({ title: '无法打开地图，请联系门店', icon: 'none' }),
  });
}
</script>

<template>
  <view class="page profile-page">
    <view class="profile-hero">
      <image src="/static/images/campus/campus-neutral.svg" mode="aspectFill" />
      <view class="hero-shade" />
      <view class="profile-copy">
        <view class="avatar"><view /></view>
        <view><view class="eyebrow">MY CAMPUS MOMENTS</view><view class="title">你好，{{ cloudMode ? '校园同学' : '演示同学' }}</view><view class="subtitle">记录生活，也记录更好的自己</view></view>
      </view>
      <view class="replace-label">待替换校园实拍</view>
    </view>

    <view class="mock-strip">{{ cloudMode ? '微信用户' : 'Mock 演示用户' }} · {{ profile.phone ? '手机号已绑定' : '未绑定真实手机号' }}</view>

    <view class="entry-list">
      <view v-for="(entry, index) in entries" :key="entry.label" class="entry-row" @click="handleEntry(entry.action)">
        <view class="entry-icon">{{ String(index + 1).padStart(2, '0') }}</view>
        <view class="entry-copy"><b>{{ entry.label }}</b><text>{{ entry.note }}</text></view>
        <text class="entry-arrow">›</text>
      </view>
    </view>

    <view class="store-card">
      <view><view class="section-title">{{ data.name || '安工程校园照相馆' }}</view><view class="muted">{{ data.address }}<br />营业时间 {{ data.hours }}</view></view>
      <view class="store-actions"><button class="ghost-button" @click="navigate">门店导航</button><button @click="go('booking')">预约拍摄</button></view>
    </view>

    <view v-if="policy" class="policy-card">{{ policy }}</view>
    <view id="contacts"><ContactEditor /></view>
    <view class="error">{{ error }}</view>
    <view class="mock-note">本系统为照相馆经营演示，不代表学校官方</view>
  </view>
  <AppTabbar active="profile" />
</template>

<style scoped lang="scss">
.profile-hero { position: relative; min-height: 265px; overflow: hidden; border-radius: 22px; }
.profile-hero > image { position: absolute; width: 100%; height: 100%; }
.hero-shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(37,35,31,.86), rgba(37,35,31,.25)); }
.profile-copy { position: absolute; z-index: 2; right: 26px; bottom: 30px; left: 30px; display: flex; align-items: center; gap: 18px; color: #fff; }
.profile-copy .eyebrow { color: #f0ca62; }
.profile-copy .title { margin: 2px 0 3px; }
.profile-copy .subtitle { color: #ede7dc; }
.avatar { display: flex; width: 76px; height: 76px; align-items: center; justify-content: center; flex: 0 0 auto; background: #fffcf6; border: 5px solid rgba(255,255,255,.72); border-radius: 50%; }
.avatar::before { width: 21px; height: 21px; background: #778872; border-radius: 50%; content: ''; }
.avatar view { position: absolute; width: 42px; height: 23px; margin-top: 35px; background: #778872; border-radius: 25px 25px 10px 10px; }
.replace-label { position: absolute; top: 12px; right: 12px; padding: 4px 7px; background: rgba(37,35,31,.72); border-radius: 4px; color: #fff; font-size: 9px; }
.mock-strip { margin: 14px 0; padding: 11px 15px; background: #f2e8dc; border-radius: 10px; color: #79594a; font-size: 11px; }
.entry-list { overflow: hidden; background: #fffcf6; border: 1px solid #e8dfd1; border-radius: 18px; }
.entry-row { display: flex; min-height: 68px; padding: 12px 17px; align-items: center; gap: 13px; border-bottom: 1px solid #eee7dc; }
.entry-row:last-child { border-bottom: 0; }
.entry-row:active { background: #f8f1e8; }
.entry-icon { display: flex; width: 34px; height: 34px; align-items: center; justify-content: center; background: #e6ece3; border: 1px solid #c8d3c4; border-radius: 50%; color: #5f7059; font-family: monospace; font-size: 10px; }
.entry-copy { flex: 1; }
.entry-copy b,.entry-copy text { display: block; }
.entry-copy b { font-size: 14px; }
.entry-copy text { margin-top: 3px; color: #888077; font-size: 10px; }
.entry-arrow { color: #a89e92; font-size: 24px; }
.store-card { display: flex; margin-top: 18px; padding: 20px; align-items: center; justify-content: space-between; gap: 15px; background: #778872; border-radius: 18px; color: #fff; }
.store-card .muted { color: #e4eadf; }
.store-actions { display: flex; gap: 8px; }
.store-actions button { margin: 0; }
.store-actions .ghost-button { border-color: rgba(255,255,255,.45); color: #fff; }
.policy-card { margin-top: 16px; padding: 16px; background: #f7edcf; border-left: 4px solid #d9a62e; color: #665323; font-size: 12px; line-height: 1.7; }
@media (max-width: 540px) {
  .store-card { align-items: stretch; flex-direction: column; }
  .store-actions button { flex: 1; }
}
</style>