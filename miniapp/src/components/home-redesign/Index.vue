<script setup lang="ts">
import AppTabbar from '../app-tabbar/Index.vue';
import BrandHeader from '../brand-header/Index.vue';
import storeConfig from '../../config/store';
import { go } from '../../composables/useData';
import { homeImageAssets } from '../../static/images/assets-manifest';

const image = (id: string) => homeImageAssets.find((item) => item.id === id)?.path || '';

const services = [
  { title: '证件照', note: '标准拍摄 · 自然精修', asset: 'id-photo-female', page: 'photo-specs' },
  { title: '在线冲印', note: '把回忆印成照片', asset: 'printing-scene', page: 'printing' },
  { title: '毕业写真', note: '青春值得被收藏', asset: 'graduation-female', page: 'packages' },
  {
    title: '校园跟拍',
    note: '记录真实校园日常',
    asset: 'photographer-at-work',
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
  { asset: 'id-photo-female-secondary', alt: '女性证件照作品', className: 'portrait' },
  { asset: 'graduation-female', alt: '单人毕业写真作品', className: 'tall' },
  { asset: 'dorm-group', alt: '宿舍合照作品', className: 'landscape' },
  { asset: 'photographer-at-work', alt: '校园跟拍作品', className: 'landscape' },
  { asset: 'photo-wall', alt: '纸质冲印作品墙', className: 'wide' },
  { asset: 'campus-tree-shade', alt: '校园生活作品', className: 'tall' },
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
      <section class="film-hero">
        <view class="hero-copy">
          <view class="hero-title">把大学时光，<br />洗成看得见的记忆。</view>
          <view class="hero-subtitle">在安工程，记录你的大学时光。</view>
        </view>

        <view class="film-collage">
          <view class="polaroid polaroid-main">
            <image :src="image('campus-hero')" mode="aspectFill" />
            <text>校园日常，也值得被好好收藏。</text>
          </view>
          <view class="polaroid polaroid-top">
            <image :src="image('campus-tree-shade')" mode="aspectFill" />
            <text>树影里的夏天</text>
          </view>
          <view class="polaroid polaroid-bottom">
            <image :src="image('photo-wall')" mode="aspectFill" />
            <text>把回忆洗出来</text>
          </view>
        </view>

        <view class="hero-actions">
          <button @click="go('booking?packageId=p8')">预约拍摄</button>
          <button class="outline-button" @click="go('printing')">在线冲印</button>
        </view>
      </section>

      <section class="service-grid" aria-label="快捷服务">
        <view
          v-for="item in services"
          :key="item.title"
          class="service-card"
          @click="go(item.page)"
        >
          <image :src="image(item.asset)" :alt="item.title" mode="aspectFill" />
          <view class="service-overlay">
            <view
              ><b>{{ item.title }}</b
              ><text>{{ item.note }}</text></view
            >
            <text class="service-arrow">→</text>
          </view>
        </view>
      </section>

      <section class="id-offer">
        <view class="offer-copy">
          <text class="offer-tag">学生专享</text>
          <h2>学生证件照</h2>
          <view class="offer-price">¥29<text class="small">起</text></view>
          <p>专业拍摄 · 自然精修<br />电子版 · 冲印版</p>
          <button @click="go('booking?packageId=p0')">立即预约</button>
        </view>
        <view class="id-stack">
          <view class="id-print female"
            ><image :src="image('id-photo-female-secondary')" mode="aspectFill"
          /></view>
          <view class="id-print male"
            ><image :src="image('id-photo-male')" mode="aspectFill"
          /></view>
        </view>
      </section>

      <section class="section-block">
        <view class="section-heading"
          ><view
            ><h2>毕业季精选</h2>
            <p>把青春最好的样子留在照片里。</p></view
          ><text @click="go('packages')">查看全部</text></view
        >
        <view class="package-grid">
          <view
            v-for="item in graduation"
            :key="item.name"
            class="package-card"
            @click="go(item.page)"
          >
            <image :src="image(item.asset)" :alt="item.name" mode="aspectFill" />
            <view class="package-copy"
              ><b>{{ item.name }}</b>
              <p>{{ item.note }}</p>
              <view
                ><strong>{{ item.price }}</strong
                ><text>查看详情</text></view
              ></view
            >
          </view>
        </view>
      </section>

      <section class="section-block works-block">
        <view class="section-heading"
          ><view
            ><h2>一帧作品</h2>
            <p>记录校园里的每一种青春。</p></view
          ></view
        >
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
        <image src="/static/images/brand/logo-mark.png" mode="aspectFit" />
        <view class="store-copy"
          ><h2>{{ storeConfig.name }}</h2>
          <p>安徽工程大学校内</p>
          <strong>地址：{{ storeConfig.address }}</strong
          ><text class="store-pending">联系方式与营业信息待店主完善</text></view
        >
        <view class="store-actions"
          ><button @click="contactStore">联系商家</button
          ><button class="outline-button" @click="showLocation">查看位置</button></view
        >
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
  padding: 0 16px calc(env(safe-area-inset-bottom) + 112px);
  box-sizing: border-box;
}
section {
  width: 100%;
  box-sizing: border-box;
}
.film-hero {
  min-height: 370px;
  padding: 21px 18px 17px;
  overflow: hidden;
  background: #f1e8d8;
  border: 1px solid #e2d6c6;
  border-radius: 0 0 24px 24px;
}
.hero-title {
  font-family: 'STKaiti', 'KaiTi', 'Songti SC', serif;
  font-size: 31px;
  font-weight: 800;
  line-height: 1.28;
  letter-spacing: 1px;
}
.hero-subtitle {
  margin-top: 7px;
  color: #686258;
  font-size: 13px;
}
.film-collage {
  display: grid;
  height: 190px;
  margin-top: 11px;
  padding: 4px 2px;
  grid-template-columns: 1.25fr 0.85fr;
  grid-template-rows: 1fr 1fr;
  gap: 10px;
}
.polaroid {
  min-width: 0;
  padding: 6px 6px 8px;
  background: #fffdf8;
  box-shadow: 0 5px 13px rgba(74, 56, 38, 0.16);
}
.polaroid image {
  display: block;
  width: 100%;
  height: calc(100% - 18px);
}
.polaroid text {
  display: block;
  height: 18px;
  overflow: hidden;
  color: #514a40;
  font-family: 'KaiTi', serif;
  font-size: 10px;
  line-height: 20px;
  text-align: center;
  white-space: nowrap;
}
.polaroid-main {
  grid-row: 1 / 3;
  transform: rotate(-2deg);
}
.polaroid-top {
  transform: rotate(3deg);
}
.polaroid-bottom {
  transform: rotate(-3deg);
}
.hero-actions {
  display: grid;
  margin-top: 12px;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.hero-actions button,
.offer-copy button,
.store-actions button {
  min-width: 0;
  margin: 0;
  white-space: nowrap;
}
.outline-button {
  background: #fffcf6;
  border: 1px solid #b64032;
  color: #b64032;
}
.service-grid {
  display: grid;
  margin-top: 18px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.service-card {
  position: relative;
  height: 152px;
  overflow: hidden;
  border-radius: 17px;
  background: #25231f;
}
.service-card > image {
  width: 100%;
  height: 100%;
}
.service-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  padding: 14px;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  background: linear-gradient(180deg, rgba(20, 18, 15, 0.03) 30%, rgba(20, 18, 15, 0.82) 100%);
  color: #fff;
}
.service-overlay b,
.service-overlay text {
  display: block;
}
.service-overlay b {
  font-size: 17px;
  line-height: 1.2;
}
.service-overlay view > text {
  margin-top: 5px;
  font-size: 12px;
  opacity: 0.88;
}
.service-arrow {
  align-self: flex-start;
  font-size: 22px;
  line-height: 1;
}
.id-offer {
  display: grid;
  min-height: 245px;
  margin-top: 22px;
  padding: 23px 16px 22px 21px;
  grid-template-columns: minmax(0, 1.1fr) minmax(120px, 0.9fr);
  gap: 8px;
  background: #efe2c7;
  border: 1px solid #e1d2b8;
  border-radius: 20px;
}
.offer-copy {
  position: relative;
  z-index: 2;
  min-width: 0;
}
.offer-tag {
  display: inline-block;
  padding: 4px 9px;
  background: #b64032;
  border-radius: 6px;
  color: #fff;
  font-size: 11px;
}
.offer-copy h2,
.section-heading h2,
.store-copy h2 {
  margin: 10px 0 0;
  font-family: 'STSong', 'Songti SC', serif;
  font-size: 22px;
  line-height: 1.25;
}
.offer-price {
  margin-top: 5px;
  color: #b64032;
  font-size: 34px;
  font-weight: 900;
}
.offer-price .small {
  margin-left: 2px;
  font-size: 13px;
}
.offer-copy p {
  margin: 4px 0 13px;
  color: #62594c;
  font-size: 11px;
  line-height: 1.65;
}
.offer-copy button {
  width: 105px;
  min-height: 38px;
  padding: 0 12px;
  font-size: 13px;
  line-height: 38px;
}
.id-stack {
  display: grid;
  align-content: center;
  grid-template-columns: 1fr 1fr;
}
.id-print {
  width: 84px;
  height: 122px;
  padding: 6px 6px 15px;
  justify-self: center;
  background: #fff;
  box-shadow: 0 6px 14px rgba(67, 50, 31, 0.18);
}
.id-print image {
  width: 100%;
  height: 100%;
}
.id-print.female {
  margin-right: -25px;
  transform: rotate(-6deg);
}
.id-print.male {
  margin-top: 31px;
  margin-left: -4px;
  transform: rotate(5deg);
}
.section-block {
  margin-top: 30px;
}
.section-heading {
  display: flex;
  margin-bottom: 14px;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}
.section-heading h2 {
  margin: 0;
  font-size: 24px;
}
.section-heading p {
  margin: 5px 0 0;
  color: #756f65;
  font-size: 12px;
}
.section-heading > text {
  flex: 0 0 auto;
  color: #b64032;
  font-size: 12px;
}
.package-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.package-card {
  min-width: 0;
  overflow: hidden;
  background: #fffcf6;
  border: 1px solid #e8dfd1;
  border-radius: 16px;
}
.package-card > image {
  display: block;
  width: 100%;
  height: 150px;
}
.package-copy {
  padding: 13px;
}
.package-copy b {
  display: block;
  overflow: hidden;
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.package-copy p {
  height: 19px;
  margin: 6px 0 11px;
  overflow: hidden;
  color: #756f65;
  font-size: 11px;
  line-height: 19px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.package-copy > view {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
}
.package-copy strong {
  color: #b64032;
  font-size: 13px;
  white-space: nowrap;
}
.package-copy text {
  color: #6c7b67;
  font-size: 10px;
  white-space: nowrap;
}
.works-grid {
  display: grid;
  grid-auto-rows: 92px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.works-grid image {
  width: 100%;
  height: 100%;
  border-radius: 13px;
}
.works-grid .tall {
  grid-row: span 2;
}
.works-grid .wide {
  grid-column: span 2;
}
.works-grid .portrait {
  grid-row: span 2;
}
.store-info {
  display: grid;
  margin-top: 30px;
  padding: 22px;
  grid-template-columns: 62px 1fr;
  gap: 14px;
  background: #778872;
  border-radius: 20px;
  color: #fff;
}
.store-info > image {
  width: 62px;
  height: 62px;
  background: #fff;
  border-radius: 50%;
}
.store-copy h2 {
  margin: 0;
  font-size: 21px;
}
.store-copy p,
.store-copy strong,
.store-copy .store-pending {
  display: block;
  margin: 4px 0 0;
}
.store-copy p {
  color: #edf1ea;
  font-size: 12px;
}
.store-copy strong {
  font-size: 13px;
}
.store-copy .store-pending {
  color: #e0e7dc;
  font-size: 10px;
}
.store-actions {
  display: grid;
  grid-column: 1 / 3;
  margin-top: 5px;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.store-actions .outline-button {
  border-color: rgba(255, 255, 255, 0.72);
  color: #fff;
  background: transparent;
}
.home-screen :deep(.tabbar) {
  width: 100%;
  max-width: 430px;
  margin-right: auto;
  margin-left: auto;
}
@media (max-width: 374px) {
  .home-main {
    padding-right: 13px;
    padding-left: 13px;
  }
  .film-hero {
    padding-right: 14px;
    padding-left: 14px;
  }
  .hero-title {
    font-size: 29px;
  }
  .service-card {
    height: 145px;
  }
  .id-offer {
    grid-template-columns: minmax(0, 1fr) 118px;
  }
  .id-print {
    width: 72px;
    height: 110px;
  }
  .package-card > image {
    height: 140px;
  }
}
</style>
