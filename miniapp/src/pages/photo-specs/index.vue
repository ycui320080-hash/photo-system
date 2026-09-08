<script setup lang="ts">
import { computed, ref } from 'vue';
import FilmImage from '../../components/film-image/Index.vue';
import { photoSpecs } from '../../../../shared/constants/photo-specs';
import { go } from '../../composables/useData';

const query = ref('');
const uses = ['教资', '四六级', '计算机等级考试', '考研', '公务员考试', '简历', '一寸', '二寸'];
const rows = computed(() => {
  const keyword = query.value.trim();
  return keyword ? photoSpecs.filter((item) => item.name.includes(keyword)) : photoSpecs;
});
function selectUse(use: string) {
  query.value = use;
}
</script>

<template>
  <view class="page specs-page">
    <view class="spec-hero">
      <view class="hero-copy">
        <view class="eyebrow">STUDENT ID PHOTO</view>
        <view class="title">学生证件照</view>
        <view class="price">¥29<small>起</small></view>
        <view class="hero-points"><text>专业拍摄</text><text>自然精修</text><text>多尺寸可选</text><text>电子版和冲印版</text></view>
        <button @click="go('booking?packageId=p0')">快速预约</button>
      </view>
      <FilmImage src="/static/images/id-photo/id-photo-sample.jpg" alt="学生证件照样片" ratio="portrait" />
    </view>

    <view class="section-head">
      <view><view class="eyebrow">QUICK GUIDE</view><view class="section-title">按用途快速查找</view></view>
    </view>
    <view class="use-grid">
      <view v-for="use in uses" :key="use" class="use-chip" :class="{ active: query === use }" @click="selectUse(use)">
        
        <text>{{ use }}</text>
      </view>
    </view>

    <view class="notice">具体照片要求请以当次官方报名通知为准。</view>
    <input v-model="query" class="search" placeholder="搜索考试或用途，如考研、教资" />

    <view class="spec-list">
      <view v-for="item in rows" :key="item.id" class="spec-card">
        <view class="row">
          <view>
            <view class="spec-name">{{ item.name }}</view>
            <view class="muted">Mock 规格数据</view>
          </view>
          <button class="small-button" @click="go('booking?packageId=' + item.packageId)">预约</button>
        </view>
        <view class="spec-data">
          <view><text>像素</text><b>{{ item.width }} × {{ item.height }}</b></view>
          <view><text>背景</text><b>{{ item.background }}</b></view>
          <view><text>格式</text><b>{{ item.format }}</b></view>
          <view><text>文件大小</text><b>{{ item.size }}</b></view>
        </view>
        <view class="spec-warning">{{ item.note }}</view>
      </view>
    </view>
    <view v-if="!rows.length" class="card">未找到匹配规格，请联系门店确认。</view>
  </view>
</template>

<style scoped lang="scss">
.spec-hero { display: grid; padding: 28px 42px; align-items: center; grid-template-columns: 1.2fr .8fr; gap: 32px; background: #778872; border-radius: 22px; color: #fff; }
.spec-hero :deep(.film-image) { width: 170px; justify-self: end; transform: rotate(3deg); }
.hero-copy .eyebrow { color: #f3d36f; }
.hero-copy .title { margin-bottom: 4px; font-size: 38px; }
.hero-copy .price { color: #fff; font-size: 34px; }
.hero-points { display: flex; margin-top: 15px; flex-wrap: wrap; gap: 8px; }
.hero-points text { padding: 6px 9px; background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.25); border-radius: 6px; font-size: 11px; }
.hero-copy button { width: 120px; background: #b64032; }
.use-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.use-chip { display: flex; min-height: 82px; padding: 12px 8px; align-items: center; justify-content: center; flex-direction: column; gap: 7px; background: #fffcf6; border: 1px solid #e8dfd1; border-radius: 14px; color: #4c4943; font-size: 12px; text-align: center; }
.use-chip.active { background: #fbefec; border: 2px solid #b64032; color: #9c3027; font-weight: 700; }
.use-icon { display: flex; width: 28px; height: 28px; align-items: center; justify-content: center; border: 1px solid currentColor; border-radius: 50%; font-size: 11px; }
.notice { margin: 20px 0 10px; padding: 13px 16px; background: #f7edcf; border-left: 4px solid #d9a62e; color: #6a5724; font-size: 12px; line-height: 1.6; }
.search { background: #fffcf6; border-color: #e8dfd1; }
.spec-list { display: grid; margin-top: 14px; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 14px; }
.spec-card { padding: 18px; background: #fffcf6; border: 1px solid #e8dfd1; border-radius: 16px; }
.spec-name { font-size: 17px; font-weight: 800; }
.small-button { min-height: 34px; margin: 0; padding: 0 14px; line-height: 34px; }
.spec-data { display: grid; margin-top: 15px; grid-template-columns: repeat(2,1fr); gap: 8px; }
.spec-data view { padding: 9px; background: #f5f0e7; border-radius: 8px; }
.spec-data text { display: block; color: #7b756c; font-size: 10px; }
.spec-data b { display: block; margin-top: 3px; font-size: 12px; }
.spec-warning { margin-top: 12px; color: #8b4d3c; font-size: 11px; line-height: 1.6; }
@media (max-width: 540px) {
  .spec-hero { padding: 24px; grid-template-columns: 1.2fr .8fr; gap: 14px; }
  .spec-hero :deep(.film-image) { width: 120px; }
  .hero-copy .title { font-size: 30px; }
  .use-grid { grid-template-columns: repeat(4, 1fr); }
  .spec-list { grid-template-columns: 1fr; }
}
@media (max-width: 380px) {
  .use-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>