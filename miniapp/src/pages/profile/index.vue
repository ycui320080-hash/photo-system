<script setup lang="ts">
import { ref } from 'vue'
import AppTabbar from '../../components/app-tabbar/Index.vue'
import ContactEditor from '../../components/ContactEditor.vue'
import storeConfig from '../../config/store'
import { go } from '../../composables/useData'

const policy = ref('')
const entries = [
  { label: '我的订单', note: '查看制作进度', action: 'orders' },
  { label: '我的预约', note: '查看到店安排', action: 'orders' },
  { label: '我的电子相册', note: '查看已交付成片', action: 'orders' },
  { label: '常用联系人', note: '管理预约联系人', action: 'contacts' },
  { label: '联系商家', note: '营业时间内联系', action: 'phone' },
  { label: '隐私与账号安全', note: '查看隐私说明', action: 'privacy' },
  { label: '关于我们', note: '认识一帧照相馆', action: 'about' },
]

function handleEntry(action: string) {
  if (action === 'orders') {
    uni.reLaunch({ url: '/pages/orders/index' })
  } else if (action === 'contacts') {
    uni.pageScrollTo({ selector: '#contacts', duration: 250 })
  } else if (action === 'phone') {
    if (storeConfig.phone) uni.makePhoneCall({ phoneNumber: storeConfig.phone })
    else uni.showToast({ title: '门店暂未设置联系电话', icon: 'none' })
  } else if (action === 'privacy') {
    policy.value = '本演示系统仅用于本机测试，请勿输入真实个人资料。正式上线前须补充运营主体、处理目的与保存期限。'
  } else if (action === 'about') {
    policy.value = '一帧照相馆提供安工程校内摄影服务。本系统为照相馆经营演示，不代表安徽工程大学官方。'
  }
}
</script>

<template>
  <view class="page profile-page">
    <view class="profile-card">
      <image class="profile-logo" src="/static/images/brand/logo-mark.png" mode="aspectFit" />
      <view><view class="title">你好，校园同学</view><view class="subtitle">把今天留在照片里。</view></view>
    </view>

    <view class="entry-list">
      <view v-for="entry in entries" :key="entry.label" class="entry-row" @click="handleEntry(entry.action)">
        <view><b>{{ entry.label }}</b><text>{{ entry.note }}</text></view>
        <text class="arrow">›</text>
      </view>
    </view>

    <view class="store-card">
      <image src="/static/images/brand/logo-full.png" mode="aspectFit" />
      <view class="store-name">{{ storeConfig.name }}</view>
      <view class="muted">{{ storeConfig.scene }}</view>
      <view class="store-address">{{ storeConfig.address }}</view>
      <view class="muted">营业时间 {{ storeConfig.hours }}</view>
      <button @click="go('booking')">预约拍摄</button>
    </view>

    <view v-if="policy" class="policy-card">{{ policy }}</view>
    <view id="contacts"><ContactEditor /></view>
    <view class="mock-note">本系统为照相馆经营演示，不代表学校官方</view>
    <AppTabbar active="profile" />
  </view>
</template>

<style scoped lang="scss">
.profile-page { padding-top: calc(env(safe-area-inset-top) + 30rpx); }
.profile-card { display: flex; padding: 34rpx; align-items: center; gap: 24rpx; background: #efe4d4; border-radius: 24rpx; }
.profile-logo { width: 110rpx; height: 110rpx; background: #fff; border-radius: 50%; }
.entry-list { margin-top: 24rpx; overflow: hidden; background: #fffcf6; border: 1rpx solid #e8dfd1; border-radius: 24rpx; }
.entry-row { display: flex; min-height: 112rpx; padding: 22rpx 28rpx; align-items: center; justify-content: space-between; border-bottom: 1rpx solid #eee7dc; }
.entry-row:last-child { border-bottom: 0; }
.entry-row b, .entry-row text { display: block; }
.entry-row b { font-size: 27rpx; }
.entry-row text { margin-top: 6rpx; color: #888077; font-size: 20rpx; }
.entry-row .arrow { color: #a89e92; font-size: 42rpx; }
.store-card { margin-top: 24rpx; padding: 30rpx; background: #fffcf6; border: 1rpx solid #e8dfd1; border-radius: 24rpx; text-align: center; }
.store-card image { width: 320rpx; height: 190rpx; }
.store-name { margin-top: 6rpx; font-size: 32rpx; font-weight: 800; }
.store-address { margin: 14rpx 0 5rpx; color: #b64032; font-size: 28rpx; font-weight: 700; }
.store-card button { width: 260rpx; margin: 24rpx auto 0; }
.policy-card { margin-top: 20rpx; padding: 22rpx; background: #f7edcf; border-left: 6rpx solid #d9a62e; color: #665323; font-size: 23rpx; line-height: 1.7; }
</style>