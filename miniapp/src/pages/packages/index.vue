<script setup lang="ts">
import { computed, ref } from 'vue';
import AppTabbar from '../../components/app-tabbar/Index.vue';
import FilmImage from '../../components/film-image/Index.vue';
import { go } from '../../composables/useData';
import { graduationPackages } from '../../mock/graduation-packages';

const categories = ['全部套餐', '单人写真', '多人合影', '校园跟拍', '班级集体照'] as const;
const category = ref<(typeof categories)[number]>('全部套餐');
const rows = computed(() =>
  graduationPackages.filter((item) => category.value === '全部套餐' || item.category === category.value),
);
</script>

<template>
  <view class="page package-page">
    <view class="package-hero">
      <FilmImage
        src="/static/images/camp/campus-hero.jpg"
        alt="毕业季校园写真"
        ratio="wide"
      />
      <view class="hero-copy">
        <view class="eyebrow">GRADUATION PORTRAIT</view>
        <view class="title">毕业写真</view>
        <view class="subtitle">毕业不是结束，而是下一张精彩的开始。</view>
      </view>
    </view>

    <scroll-view class="category-scroll" scroll-x>
      <view class="category-row">
        <view
          v-for="item in categories"
          :key="item"
          class="category-chip"
          :class="{ active: category === item }"
          @click="category = item"
        >
          {{ item }}
        </view>
      </view>
    </scroll-view>

    <view class="mock-note">以下套餐和价格为 Mock 演示，最终内容以门店确认为准</view>

    <view class="package-list">
      <view v-for="item in rows" :key="item.id" class="package-row">
        <FilmImage
          class="package-photo"
          src="/static/images/camp/campus-hero.jpg"
          :alt="item.name + ''"
          ratio="square"
        />
        <view class="package-info">
          <view class="row">
            <view>
              <view class="package-name">{{ item.name }}</view>
              <view class="category-label">{{ item.category }}</view>
            </view>
            <view class="package-price">{{ item.price }}</view>
          </view>
          <view class="muted">{{ item.description }}</view>
          <view class="feature-list">
            <text v-for="feature in item.features" :key="feature">{{ feature }}</text>
          </view>
          <button @click="go('booking?packageId=' + item.id)">立即预约</button>
        </view>
      </view>
    </view>
  </view>
  <AppTabbar active="packages" />
</template>

<style scoped lang="scss">
.package-hero { position: relative; overflow: hidden; background: #25231f; border-radius: 22px; }
.package-hero :deep(.film-image) { border: 0; opacity: .76; }
.package-hero::after { position: absolute; inset: 0; background: rgba(37,35,31,.58); content: ''; }
.hero-copy { position: absolute; z-index: 2; top: 50%; left: 34px; color: #fff; transform: translateY(-50%); }
.hero-copy .eyebrow { color: #edc75f; }
.hero-copy .title { margin-bottom: 5px; font-size: 38px; }
.hero-copy .subtitle { color: #f1eadf; }
.category-scroll { margin: 22px 0 4px; white-space: nowrap; }
.category-row { display: inline-flex; gap: 9px; }
.category-chip { padding: 9px 15px; background: #fffcf6; border: 1px solid #e8dfd1; border-radius: 999px; color: #6f6960; font-size: 13px; }
.category-chip.active { background: #b64032; border-color: #b64032; color: #fff; font-weight: 700; }
.package-list { display: grid; margin-top: 18px; gap: 15px; }
.package-row { display: grid; padding: 16px; align-items: stretch; grid-template-columns: 210px 1fr; gap: 20px; background: #fffcf6; border: 1px solid #e8dfd1; border-radius: 18px; box-shadow: 0 8px 24px rgba(67,54,41,.06); }
.package-photo { width: 100%; }
.package-info { display: flex; justify-content: center; flex-direction: column; }
.package-name { font-size: 20px; font-weight: 800; }
.category-label { margin-top: 4px; color: #778872; font-size: 11px; }
.package-price { color: #b64032; font-size: 19px; font-weight: 900; }
.feature-list { display: flex; margin-top: 12px; flex-wrap: wrap; gap: 7px; }
.feature-list text { padding: 5px 8px; background: #f1eee5; border-radius: 6px; color: #5f5a51; font-size: 11px; }
.package-info button { width: 112px; min-height: 38px; line-height: 38px; }
@media (max-width: 600px) {
  .package-row { grid-template-columns: 118px 1fr; gap: 14px; }
  .package-name { font-size: 17px; }
  .hero-copy { left: 22px; }
  .hero-copy .title { font-size: 32px; }
  .hero-copy .subtitle { max-width: 210px; font-size: 12px; }
}
@media (max-width: 380px) {
  .package-row { grid-template-columns: 1fr; }
  .package-photo { max-height: 180px; }
}
</style>