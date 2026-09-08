<script setup lang="ts">
const platform = uni;
import AppTabbar from '../../components/app-tabbar/Index.vue';
import FilmImage from '../../components/film-image/Index.vue';
import { useData, go } from '../../composables/useData';
import { api } from '../../services/api';

const { data, error } = useData(() => api('/settings'), {});

const services = [
  { title: '证件照', note: '标准 · 精修 · 快速', tone: 'sage', icon: 'ID', page: 'photo-specs' },
  { title: '在线冲印', note: '把回忆印出来', tone: 'brick', icon: 'PRINT', page: 'printing' },
  { title: '毕业写真', note: '青春纪念册', tone: 'yellow', icon: 'GRAD', page: 'packages' },
  { title: '校园跟拍', note: '记录校园日常', tone: 'sage-dark', icon: 'SNAP', page: 'booking?packageId=p13' },
];

const graduation = [
  { name: '单人毕业写真', note: '学士服 · 校园取景 · 自然精修', price: '¥299起', id: 'p8' },
  { name: '宿舍合照', note: '和室友再拍一次青春', price: '¥499起', id: 'p10' },
  { name: '校园跟拍', note: '2小时跟拍 · 全部底片', price: '¥399起', id: 'p13' },
  { name: '班级集体照', note: '班级与社团均可预约', price: '到店咨询', id: 'p12' },
];
</script>

<template>
  <view class="page home-page">
    <view class="cover">
      <view class="cover-copy">
        <view class="eyebrow">CAMPUS PHOTO STUDIO</view>
        <view class="cover-title">安工程<br />校园照相馆</view>
        <view class="cover-slogan">把大学时光，洗成看得见的记忆。</view>
        <view class="hand-note">在安工程，记录你的大学时光</view>
        <button class="cover-button" @click="go('booking?packageId=p8')">预约一组校园照片</button>
      </view>
      <view class="collage">
        <view class="tape tape-one" />
        <FilmImage class="photo photo-main" src="/static/images/campus/campus-neutral.svg" alt="校园道路中性占位图" ratio="portrait" />
        <FilmImage class="photo photo-side" src="/static/images/graduation/graduation-neutral.svg" alt="毕业合影中性占位图" ratio="square" />
        <view class="film-mark">01 · YOUTH</view>
      </view>
    </view>

    <view class="service-grid">
      <view v-for="service in services" :key="service.title" class="service-card" :class="service.tone" @click="go(service.page)">
        <view class="service-icon"><text>{{ service.icon }}</text></view>
        <view><view class="service-title">{{ service.title }}</view><view class="service-note">{{ service.note }}</view></view>
        <text class="arrow">↗</text>
      </view>
    </view>

    <view class="benefit">
      <view class="benefit-copy">
        <view class="benefit-label">学生专享</view>
        <view class="section-title">学生专属福利</view>
        <view class="benefit-price">证件照套餐 <text>¥29起</text></view>
        <view class="benefit-note">专业拍摄 · 自然精修 · 电子版 · 冲印版</view>
        <button @click="go('photo-specs')">立即查看</button>
      </view>
      <FilmImage class="benefit-photo" src="/static/images/id-photo/id-photo-neutral.svg" alt="证件照样片中性占位图" ratio="portrait" />
    </view>

    <view class="section-head">
      <view><view class="eyebrow">GRADUATION SEASON</view><view class="section-title">毕业季精选</view></view>
      <text class="section-note" @click="go('packages')">查看全部 ↗</text>
    </view>
    <scroll-view class="package-scroll" scroll-x enable-flex>
      <view v-for="item in graduation" :key="item.name" class="package-card" @click="go('booking?packageId=' + item.id)">
        <FilmImage src="/static/images/packages/package-neutral.svg" :alt="item.name + '中性占位图'" ratio="wide" />
        <view class="package-body">
          <view class="package-name">{{ item.name }}</view>
          <view class="muted">{{ item.note }}</view>
          <view class="package-bottom"><text class="package-price">{{ item.price }}</text><text class="detail-link">查看详情</text></view>
        </view>
      </view>
    </scroll-view>

    <view class="store-card">
      <view>
        <view class="section-title">今天，也值得被记录。</view>
        <view class="muted">{{ data.name || '安工程校园照相馆' }} · {{ data.hours }}</view>
        <view class="muted">{{ data.address }}</view>
      </view>
      <button v-if="data.phone" class="ghost-button" @click="platform.makePhoneCall({ phoneNumber: data.phone })">联系门店</button>
    </view>
    <view class="error">{{ error }}</view>
    <view class="mock-note">本地 Mock 演示 · 图片为中性占位素材</view>
  </view>
  <AppTabbar active="home" />
</template>

<style scoped lang="scss">
.cover { position: relative; display: grid; min-height: 430px; padding: 40px; overflow: hidden; grid-template-columns: .95fr 1.05fr; background: #25231f; border-radius: 24px; color: #fffaf2; }
.cover::after { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,.12) .7px, transparent .7px); background-size: 5px 5px; content: ''; opacity: .28; pointer-events: none; }
.cover-copy { position: relative; z-index: 2; display: flex; align-items: flex-start; justify-content: center; flex-direction: column; }
.cover .eyebrow { color: #d9a62e; }
.cover-title { margin: 14px 0; font-family: 'STSong','Songti SC',serif; font-size: 48px; font-weight: 900; line-height: 1.08; }
.cover-slogan { max-width: 280px; color: #ded5c7; line-height: 1.8; }
.hand-note { margin-top: 22px; color: #d9a62e; font-family: cursive; font-size: 13px; transform: rotate(-2deg); }
.cover-button { margin-top: 24px; background: #b64032; }
.collage { position: relative; min-height: 350px; }
.photo { position: absolute; }
.photo-main { top: 2%; right: 8%; width: 55%; transform: rotate(4deg); }
.photo-side { bottom: 2%; left: 2%; width: 45%; transform: rotate(-7deg); }
.tape { position: absolute; z-index: 4; width: 72px; height: 20px; background: rgba(227,209,164,.82); transform: rotate(-8deg); }
.tape-one { top: 3%; right: 25%; }
.film-mark { position: absolute; right: 0; bottom: 3%; color: #d9a62e; font-size: 10px; letter-spacing: 2px; transform: rotate(90deg); }
.service-grid { display: grid; margin-top: 18px; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.service-card { position: relative; min-height: 158px; padding: 22px; border-radius: 18px; color: #fff; transition: transform 120ms ease, opacity 120ms ease; }
.service-card:active { transform: scale(.98); opacity: .88; }
.service-card.sage { background: #778872; }
.service-card.sage-dark { background: #62705e; }
.service-card.brick { background: #b64032; }
.service-card.yellow { background: #d9a62e; color: #25231f; }
.service-icon { display: inline-flex; width: 39px; height: 39px; margin-bottom: 25px; align-items: center; justify-content: center; border: 1.5px solid currentColor; border-radius: 50%; font-size: 8px; font-weight: 800; letter-spacing: .5px; }
.service-title { font-size: 18px; font-weight: 800; }
.service-note { margin-top: 5px; font-size: 11px; opacity: .8; }
.arrow { position: absolute; top: 18px; right: 18px; font-size: 20px; }
.benefit { display: grid; margin-top: 32px; padding: 28px 36px; align-items: center; grid-template-columns: 1.25fr .75fr; gap: 28px; background: #d9a62e; border-radius: 22px; }
.benefit-label { display: inline-flex; margin-bottom: 12px; padding: 5px 9px; background: #25231f; border-radius: 4px; color: #fff; font-size: 10px; font-weight: 700; }
.benefit-price { margin: 12px 0 4px; font-size: 16px; }
.benefit-price text { color: #9e3027; font-size: 26px; font-weight: 900; }
.benefit-note { color: #4f493e; font-size: 12px; line-height: 1.8; }
.benefit button { width: 136px; }
.benefit-photo { width: min(190px, 100%); justify-self: end; transform: rotate(3deg); }
.package-scroll { width: 100%; white-space: nowrap; }
.package-card { display: inline-block; width: 270px; margin-right: 14px; overflow: hidden; vertical-align: top; white-space: normal; background: #fffcf6; border: 1px solid #e8dfd1; border-radius: 17px; }
.package-body { padding: 15px; }
.package-name { margin-bottom: 6px; font-size: 17px; font-weight: 800; }
.package-bottom { display: flex; margin-top: 14px; align-items: center; justify-content: space-between; }
.package-price { color: #b64032; font-weight: 800; }
.detail-link { color: #5f6e59; font-size: 12px; text-decoration: underline; }
.store-card { display: flex; margin-top: 30px; padding: 24px; align-items: center; justify-content: space-between; gap: 20px; background: #fffcf6; border: 1px solid #e8dfd1; border-radius: 18px; }
.store-card button { flex: 0 0 auto; }
@media (max-width: 680px) {
  .cover { min-height: 560px; padding: 30px 24px; grid-template-columns: 1fr; }
  .cover-title { font-size: 39px; }
  .collage { min-height: 280px; }
  .service-grid { grid-template-columns: repeat(2, 1fr); }
  .service-card { min-height: 138px; }
  .benefit { padding: 24px; grid-template-columns: 1.2fr .8fr; }
  .benefit-photo { width: 130px; }
}
@media (max-width: 380px) {
  .benefit { grid-template-columns: 1fr; }
  .benefit-photo { display: none; }
}
</style>