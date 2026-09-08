<script setup lang="ts">
import AppTabbar from '../app-tabbar/Index.vue';
import BrandHeader from '../brand-header/Index.vue';
import storeConfig from '../../config/store';
import { go } from '../../composables/useData';
import { homeImageAssets } from '../../static/images/assets-manifest';

const image = (id: string) => homeImageAssets.find((item) => item.id === id)?.path || '';

const primaryServices = [
  {
    title: '预约拍摄',
    note: '证件照、毕业写真、校园跟拍',
    page: 'booking?packageId=p8',
    primary: true,
  },
  { title: '在线冲印', note: '上传照片，到店取件', page: 'printing', primary: false },
];

const quickServices = [
  {
    title: '证件照',
    note: '标准拍摄 · 精修',
    icon: '/static/icons/line/portrait.svg',
    tone: 'sage',
    page: 'photo-specs',
  },
  {
    title: '在线冲印',
    note: '照片上传 · 取件',
    icon: '/static/icons/line/print.svg',
    tone: 'brick',
    page: 'printing',
  },
  {
    title: '毕业写真',
    note: '校园取景 · 留影',
    icon: '/static/icons/line/graduation.svg',
    tone: 'yellow',
    page: 'packages',
  },
  {
    title: '校园跟拍',
    note: '自然抓拍 · 底片',
    icon: '/static/icons/line/camera.svg',
    tone: 'cream',
    page: 'booking?packageId=p13',
  },
];

const graduation = [
  {
    name: '单人毕业写真',
    note: '学士服 · 校园取景',
    price: '¥299起',
    asset: 'graduation-male',
    page: 'booking?packageId=p8',
  },
  {
    name: '宿舍合照',
    note: '和室友再拍一次青春',
    price: '¥499起',
    asset: 'dorm-group',
    page: 'booking?packageId=p10',
  },
  {
    name: '校园跟拍',
    note: '自然抓拍 · 全部底片',
    price: '¥399起',
    asset: 'campus-follow-shoot',
    page: 'booking?packageId=p13',
  },
  {
    name: '班级集体照',
    note: '班级与社团均可预约',
    price: '到店咨询',
    asset: 'class-group',
    page: 'booking?packageId=p12',
  },
];

const works = [
  { asset: 'campus-tree-shade', alt: '校园道路', className: 'tall' },
  { asset: 'dorm-group-secondary', alt: '宿舍合照', className: 'regular' },
  { asset: 'graduation-group-secondary', alt: '毕业合影', className: 'wide' },
  { asset: 'campus-follow-secondary', alt: '校园跟拍', className: 'tall' },
  { asset: 'id-photo-female', alt: '学生证件照', className: 'portrait' },
  { asset: 'printing-scene', alt: '照片冲印', className: 'regular' },
  { asset: 'photographer-at-work', alt: '摄影师拍摄现场', className: 'regular' },
  { asset: 'photo-wall', alt: '照片墙与纸质照片', className: 'wide' },
];

function contactStore() {
  if (storeConfig.phone) uni.makePhoneCall({ phoneNumber: storeConfig.phone });
  else uni.showToast({ title: '联系方式待店主完善', icon: 'none' });
}

function showLocation() {
  uni.showModal({
    title: storeConfig.name,
    content: '地址：' + storeConfig.address + '\n地图位置待店主完善',
    showCancel: false,
  });
}
</script>

<template>
  <view class="home-screen">
    <BrandHeader />

    <main class="home-main">
      <section class="hero-card">
        <view class="hero-visual">
          <image
            class="hero-image"
            :src="image('campus-hero')"
            alt="校园主视觉"
            mode="aspectFill"
          />
          <view class="hero-polaroid">
            <image :src="image('graduation-female')" alt="纸质照片墙" mode="aspectFill" />
          </view>
        </view>
        <view class="hero-copy">
          <h1>把大学时光，<br />洗成看得见的记忆。</h1>
          <p>在安工程，记录你的大学时光。</p>
        </view>
      </section>

      <section class="primary-services" aria-label="主要服务">
        <view v-for="item in primaryServices" :key="item.title" class="primary-service">
          <button :class="{ secondary: !item.primary }" @click="go(item.page)">
            {{ item.title }}
          </button>
          <text>{{ item.note }}</text>
        </view>
      </section>

      <section class="quick-grid" aria-label="快捷功能">
        <view
          v-for="item in quickServices"
          :key="item.title"
          class="quick-card"
          :class="item.tone"
          @click="go(item.page)"
        >
          <view class="quick-icon"><image :src="item.icon" mode="aspectFit" /></view>
          <view class="quick-copy">
            <strong>{{ item.title }}</strong>
            <text>{{ item.note }}</text>
          </view>
        </view>
      </section>

      <section class="recommend-section">
        <view class="section-heading">
          <view>
            <h2>学生证件照</h2>
            <p>自然、干净，也保留你的样子。</p>
          </view>
          <text class="section-price">¥29起</text>
        </view>
        <view class="id-offer">
          <view class="offer-copy">
            <text class="offer-tag">学生专享</text>
            <p>专业拍摄 · 自然精修<br />电子版 · 冲印版</p>
            <button @click="go('booking?packageId=p0')">立即预约</button>
          </view>
          <image
            class="offer-photo"
            :src="image('id-photo-female-secondary')"
            alt="女性证件照样片"
            mode="aspectFill"
          />
        </view>
      </section>

      <section class="recommend-section graduation-section">
        <view class="section-heading">
          <view>
            <h2>毕业写真推荐</h2>
            <p>毕业前，再认真拍一次青春。</p>
          </view>
          <text class="section-link" @click="go('packages')">全部套餐</text>
        </view>
        <scroll-view class="graduation-scroll" scroll-x enable-flex show-scrollbar="false">
          <view class="graduation-track">
            <view
              v-for="item in graduation"
              :key="item.name"
              class="graduation-card"
              @click="go(item.page)"
            >
              <image :src="image(item.asset)" :alt="item.name" mode="aspectFill" />
              <view class="graduation-copy">
                <strong>{{ item.name }}</strong>
                <text>{{ item.note }}</text>
                <b>{{ item.price }}</b>
              </view>
            </view>
          </view>
        </scroll-view>
      </section>

      <section class="recommend-section">
        <view class="section-heading">
          <view>
            <h2>一帧作品</h2>
            <p>记录校园里的每一种青春。</p>
          </view>
        </view>
        <view class="works-grid">
          <image
            v-for="item in works"
            :key="item.asset"
            :class="item.className"
            :src="image(item.asset)"
            :alt="item.alt"
            mode="aspectFill"
          />
        </view>
      </section>

      <section class="store-info">
        <view class="store-heading">
          <image src="/static/images/brand/logo-mark.png" mode="aspectFit" />
          <view>
            <h2>{{ storeConfig.name }}</h2>
            <p>安徽工程大学校内摄影服务</p>
          </view>
        </view>
        <text class="store-address">地址：{{ storeConfig.address }}</text>
        <view class="store-actions">
          <button @click="contactStore">联系商家</button>
          <button class="secondary" @click="showLocation">查看位置</button>
        </view>
      </section>
    </main>

    <AppTabbar active="home" />
  </view>
</template>

<style scoped lang="scss">
.home-screen {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  background: #f7f3ea;
  color: #25231f;
}
.home-main {
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
  padding: 0 16px calc(92px + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
section {
  width: 100%;
  box-sizing: border-box;
}
.hero-card {
  height: 270px;
  overflow: hidden;
  background: #fffcf6;
  border: 1px solid #e8dfd1;
  border-radius: 18px;
}
.hero-visual {
  position: relative;
  height: 152px;
}
.hero-image {
  display: block;
  width: 100%;
  height: 100%;
}
.hero-polaroid {
  position: absolute;
  right: 15px;
  bottom: 10px;
  width: 78px;
  height: 99px;
  padding: 5px 5px 13px;
  box-sizing: border-box;
  background: #fff;
  box-shadow: 0 5px 14px rgba(48, 39, 29, 0.18);
  transform: rotate(3deg);
}
.hero-polaroid image {
  width: 100%;
  height: 100%;
}
.hero-copy {
  padding: 15px 18px 13px;
}
.hero-copy h1 {
  margin: 0;
  font-family: 'STKaiti', 'KaiTi', 'Songti SC', serif;
  font-size: 25px;
  font-weight: 800;
  line-height: 1.23;
  letter-spacing: 0.5px;
}
.hero-copy p {
  margin: 7px 0 0;
  color: #6c675f;
  font-size: 12px;
  white-space: nowrap;
}
.primary-services {
  display: grid;
  margin-top: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.primary-service {
  min-width: 0;
}
.primary-service button,
.offer-copy button,
.store-actions button {
  width: 100%;
  height: 46px;
  min-height: 46px;
  margin: 0;
  padding: 0 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  line-height: 46px;
  white-space: nowrap;
}
.primary-service button,
.offer-copy button,
.store-actions button:first-child {
  background: #b64032;
  color: #fff;
}
.primary-service button.secondary,
.store-actions button.secondary {
  background: #fffcf6;
  border: 1px solid #b64032;
  color: #b64032;
}
.primary-service > text {
  display: block;
  margin-top: 5px;
  overflow: hidden;
  color: #746f67;
  font-size: 9px;
  line-height: 14px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.quick-grid {
  display: grid;
  margin-top: 19px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.quick-card {
  display: flex;
  height: 96px;
  padding: 15px;
  box-sizing: border-box;
  align-items: center;
  gap: 11px;
  border: 1px solid rgba(95, 87, 75, 0.08);
  border-radius: 14px;
  transition:
    transform 120ms ease,
    opacity 120ms ease;
}
.quick-card:active {
  opacity: 0.84;
  transform: scale(0.98);
}
.quick-card.sage {
  background: #e5ebe2;
}
.quick-card.brick {
  background: #f2dfda;
}
.quick-card.yellow {
  background: #f2e5ba;
}
.quick-card.cream {
  background: #fffcf6;
  border-color: #e8dfd1;
}
.quick-icon {
  display: flex;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  background: rgba(255, 252, 246, 0.7);
  border-radius: 12px;
}
.quick-icon image {
  width: 22px;
  height: 22px;
}
.quick-copy {
  min-width: 0;
}
.quick-copy strong,
.quick-copy text {
  display: block;
}
.quick-copy strong {
  font-size: 16px;
  line-height: 1.25;
}
.quick-copy text {
  margin-top: 5px;
  overflow: hidden;
  color: #67645e;
  font-size: 10px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.recommend-section {
  margin-top: 28px;
}
.section-heading {
  display: flex;
  margin-bottom: 12px;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}
.section-heading > view {
  min-width: 0;
}
.section-heading h2 {
  margin: 0;
  font-family: 'STSong', 'Songti SC', serif;
  font-size: 22px;
  line-height: 1.2;
}
.section-heading p {
  margin: 5px 0 0;
  color: #777169;
  font-size: 11px;
}
.section-price {
  flex: 0 0 auto;
  color: #b64032;
  font-size: 20px;
  font-weight: 800;
}
.section-link {
  flex: 0 0 auto;
  color: #b64032;
  font-size: 11px;
}
.id-offer {
  display: grid;
  min-height: 174px;
  padding: 16px 15px 16px 18px;
  grid-template-columns: minmax(0, 1fr) 108px;
  gap: 12px;
  align-items: center;
  background: #efe2c7;
  border: 1px solid #e1d2b8;
  border-radius: 16px;
}
.offer-copy {
  min-width: 0;
}
.offer-tag {
  display: inline-block;
  padding: 4px 8px;
  background: #b64032;
  border-radius: 5px;
  color: #fff;
  font-size: 10px;
}
.offer-copy p {
  margin: 12px 0 14px;
  color: #5f574d;
  font-size: 12px;
  line-height: 1.65;
}
.offer-copy button {
  width: 104px;
  height: 40px;
  min-height: 40px;
  font-size: 12px;
  line-height: 40px;
}
.offer-photo {
  width: 108px;
  height: 135px;
  background: #fff;
  border: 5px solid #fff;
  box-sizing: border-box;
  box-shadow: 0 5px 14px rgba(67, 50, 31, 0.16);
  transform: rotate(2deg);
}
.graduation-section {
  overflow: hidden;
}
.graduation-scroll {
  width: 100%;
  white-space: nowrap;
}
.graduation-track {
  display: flex;
  width: max-content;
  padding-right: 16px;
  gap: 10px;
}
.graduation-card {
  display: inline-flex;
  width: 218px;
  overflow: hidden;
  flex: 0 0 auto;
  flex-direction: column;
  background: #fffcf6;
  border: 1px solid #e8dfd1;
  border-radius: 14px;
}
.graduation-card:active {
  opacity: 0.84;
}
.graduation-card > image {
  display: block;
  width: 100%;
  height: 124px;
}
.graduation-copy {
  display: flex;
  padding: 11px 12px 12px;
  flex-direction: column;
}
.graduation-copy strong,
.graduation-copy text,
.graduation-copy b {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.graduation-copy strong {
  font-size: 14px;
}
.graduation-copy text {
  margin-top: 4px;
  color: #777169;
  font-size: 10px;
}
.graduation-copy b {
  margin-top: 8px;
  color: #b64032;
  font-size: 13px;
}
.works-grid {
  display: grid;
  grid-auto-rows: 102px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.works-grid image {
  width: 100%;
  height: 100%;
  border-radius: 10px;
}
.works-grid .tall,
.works-grid .portrait {
  grid-row: span 2;
}
.works-grid .wide {
  grid-column: span 2;
}
.store-info {
  margin-top: 28px;
  padding: 19px;
  background: #778872;
  border-radius: 16px;
  color: #fff;
}
.store-heading {
  display: flex;
  align-items: center;
  gap: 11px;
}
.store-heading > image {
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  background: #fff;
  border-radius: 50%;
}
.store-heading h2 {
  margin: 0;
  font-family: 'STSong', 'Songti SC', serif;
  font-size: 19px;
}
.store-heading p {
  margin: 4px 0 0;
  color: #edf1ea;
  font-size: 11px;
}
.store-address {
  display: block;
  margin-top: 14px;
  font-size: 12px;
}
.store-actions {
  display: grid;
  margin-top: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.store-actions button {
  height: 42px;
  min-height: 42px;
  font-size: 12px;
  line-height: 42px;
}
.store-actions button.secondary {
  border-color: rgba(255, 255, 255, 0.75);
  color: #fff;
  background: transparent;
}
@media (max-width: 374px) {
  .home-main {
    padding-right: 13px;
    padding-left: 13px;
  }
  .hero-copy {
    padding-right: 15px;
    padding-left: 15px;
  }
  .hero-copy h1 {
    font-size: 23px;
  }
  .quick-card {
    padding: 13px;
    gap: 8px;
  }
  .quick-icon {
    width: 34px;
    height: 34px;
  }
  .quick-copy strong {
    font-size: 15px;
  }
}
</style>
