<script setup lang="ts">
import { computed, ref } from 'vue';
import AppTabbar from '../../components/app-tabbar/Index.vue';
import FilmImage from '../../components/film-image/Index.vue';
import { printAmount } from '../../../../shared/constants/printing';
import { money } from '../../../../shared/utils/format';
import { submitPrint } from '../../services/printing.service';

const photos = ref<string[]>([]);
const sizes = [
  { name: '5寸', description: '127 × 89mm', price: '¥1.5/张' },
  { name: '6寸', description: '152 × 102mm', price: '¥2/张' },
  { name: '一寸证件照', description: '排版冲印', price: '¥5/版' },
  { name: '二寸证件照', description: '排版冲印', price: '¥6/版' },
];
const papers = [
  { name: '光面相纸', value: '光面', note: '色彩鲜明，表面光滑' },
  { name: '绒面相纸', value: '绒面', note: '耐指纹，质感柔和' },
  { name: '复古照片纸', value: '复古', note: '暖调颗粒，适合日常记录' },
];
const size = ref('6寸');
const quantity = ref(1);
const paper = ref('光面');
const laminate = ref(false);
const date = ref(new Date(Date.now() + 86400000).toLocaleDateString('sv-SE'));
const busy = ref(false);
const error = ref('');
const success = ref('');

const amount = computed(() => {
  try {
    return printAmount(size.value, quantity.value, paper.value, laminate.value, photos.value.length);
  } catch {
    return 0;
  }
});

function choose() {
  uni.chooseImage({
    count: 20,
    sizeType: ['original'],
    success: (result) => {
      photos.value = result.tempFilePaths as string[];
      error.value = '';
    },
    fail: () => {
      uni.showToast({ title: '未选择图片', icon: 'none' });
    },
  });
}
function changeQuantity(step: number) {
  quantity.value = Math.min(100, Math.max(1, quantity.value + step));
}
async function submit() {
  if (!photos.value.length) {
    error.value = '请先上传需要冲印的照片';
    return;
  }
  busy.value = true;
  error.value = '';
  success.value = '';
  try {
    const result = await submitPrint(photos.value, {
      size: size.value,
      quantity: String(quantity.value),
      paper: paper.value,
      laminate: String(laminate.value),
      pickup: date.value + 'T18:00:00+08:00',
    });
    success.value = result.id;
    photos.value = [];
    uni.showToast({ title: '冲印订单已提交', icon: 'success' });
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <view class="page printing-page">
    <view class="page-head">
      <view><view class="eyebrow">PHOTO PRINTING</view><view class="title">在线冲印</view><view class="subtitle">让屏幕里的回忆，重新回到手中。</view></view>
      <view class="step-mark">01—04</view>
    </view>
    <FilmImage src="/static/images/printing/printing-neutral.svg" alt="校园拍立得冲印横幅中性占位图" ratio="wide" />

    <view v-if="success" class="success-card">
      <view class="success-check">✓</view>
      <view><b>冲印订单已提交</b><view class="muted">订单编号 {{ success }} · 到店付款</view></view>
    </view>

    <view class="section-head"><view><view class="eyebrow">STEP 01</view><view class="section-title">上传照片</view></view><text class="section-note">{{ photos.length }} / 20</text></view>
    <view class="upload-card" @click="choose">
      <view class="upload-icon"><view /></view>
      <view class="upload-title">{{ photos.length ? '重新选择照片' : '点击选择照片' }}</view>
      <view class="muted">支持 JPG、JPEG、PNG · 单张不超过 10MB · 最多 20 张</view>
    </view>
    <view v-if="photos.length" class="photo-preview">
      <image v-for="photo in photos" :key="photo" :src="photo" mode="aspectFill" />
    </view>

    <view class="section-head"><view><view class="eyebrow">STEP 02</view><view class="section-title">选择尺寸</view></view></view>
    <view class="option-grid">
      <view v-for="item in sizes" :key="item.name" class="select-chip" :class="{ 'is-selected': size === item.name }" @click="size = item.name">
        <view class="select-check">✓</view><b>{{ item.name }}</b><view class="muted">{{ item.description }}</view><view class="option-price">{{ item.price }}</view>
      </view>
    </view>

    <view class="section-head"><view><view class="eyebrow">STEP 03</view><view class="section-title">相纸与数量</view></view></view>
    <view class="paper-grid">
      <view v-for="item in papers" :key="item.value" class="select-chip" :class="{ 'is-selected': paper === item.value }" @click="paper = item.value">
        <view class="select-check">✓</view><b>{{ item.name }}</b><view class="muted">{{ item.note }}</view>
      </view>
    </view>
    <view class="control-card">
      <view class="row">
        <view><b>每张打印数量</b><view class="muted">每张照片使用相同数量</view></view>
        <view class="stepper"><text @click="changeQuantity(-1)">−</text><b>{{ quantity }}</b><text @click="changeQuantity(1)">＋</text></view>
      </view>
      <view class="control-line" />
      <view class="row"><view><b>塑封保护</b><view class="muted">每张加 ¥1，防水耐折</view></view><switch color="#B64032" :checked="laminate" @change="laminate = ($event as any).detail.value" /></view>
    </view>

    <view class="section-head"><view><view class="eyebrow">STEP 04</view><view class="section-title">取件时间</view></view></view>
    <picker class="pickup-picker" mode="date" :value="date" @change="date = $event.detail.value">
      <view><b>{{ date }}</b><text>18:00 后到店取件　›</text></view>
    </picker>
    <view class="error">{{ error }}</view>
    <view class="mock-note">Mock 演示订单 · 请勿上传真实敏感图片</view>
  </view>

  <view class="checkout-bar">
    <view><text class="muted">预计金额</text><view class="price">¥{{ money(amount) }}</view></view>
    <button :loading="busy" :disabled="busy || !photos.length" @click="submit">提交冲印</button>
  </view>
  <AppTabbar active="printing" />
</template>

<style scoped lang="scss">
.printing-page { padding-bottom: calc(env(safe-area-inset-bottom) + 190px); }
.step-mark { color: #b64032; font-family: serif; font-size: 13px; letter-spacing: 2px; }
.printing-page > :deep(.film-image) { border-radius: 18px; }
.success-card { display: flex; margin-top: 18px; padding: 16px; align-items: center; gap: 12px; background: #e5ece2; border: 1px solid #cbd8c6; border-radius: 14px; }
.success-check { display: flex; width: 34px; height: 34px; align-items: center; justify-content: center; background: #778872; border-radius: 50%; color: #fff; font-weight: 800; }
.upload-card { display: flex; min-height: 166px; padding: 24px; align-items: center; justify-content: center; flex-direction: column; background: #fffcf6; border: 1.5px dashed #c8b9a8; border-radius: 18px; text-align: center; }
.upload-icon { position: relative; width: 44px; height: 36px; margin-bottom: 10px; border: 2px solid #b64032; border-radius: 6px; }
.upload-icon::before { position: absolute; top: -8px; left: 9px; width: 20px; height: 8px; background: #b64032; border-radius: 4px 4px 0 0; content: ''; }
.upload-icon view { width: 11px; height: 11px; margin: 11px auto; border: 2px solid #b64032; border-radius: 50%; }
.upload-title { margin-bottom: 5px; font-weight: 800; }
.photo-preview { display: grid; margin-top: 12px; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.photo-preview image { width: 100%; height: 88px; border-radius: 8px; }
.option-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.option-price { margin-top: 9px; color: #b64032; font-size: 12px; font-weight: 700; }
.paper-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
.control-card { margin-top: 12px; padding: 18px; background: #fffcf6; border: 1px solid #e8dfd1; border-radius: 16px; }
.control-line { height: 1px; margin: 15px 0; background: #ebe3d7; }
.stepper { display: grid; overflow: hidden; grid-template-columns: 38px 42px 38px; border: 1px solid #e0d5c7; border-radius: 10px; text-align: center; }
.stepper text,.stepper b { height: 36px; line-height: 36px; }
.stepper text { background: #f3ece2; color: #b64032; font-size: 18px; }
.pickup-picker { padding: 18px; background: #fffcf6; border: 1px solid #e8dfd1; border-radius: 16px; }
.pickup-picker view { display: flex; justify-content: space-between; }
.pickup-picker text { color: #756f65; font-size: 12px; }
.checkout-bar { position: fixed; z-index: 45; right: 0; bottom: calc(env(safe-area-inset-bottom) + 72px); left: 0; display: flex; min-height: 78px; padding: 10px max(18px, calc((100vw - 900px) / 2)); align-items: center; justify-content: space-between; background: #fffcf6; border-top: 1px solid #e8dfd1; box-shadow: 0 -7px 20px rgba(67,54,41,.06); }
.checkout-bar .price { line-height: 1.1; }
.checkout-bar button { min-width: 150px; margin: 0; }
@media (max-width: 560px) {
  .option-grid { grid-template-columns: repeat(2,1fr); }
  .paper-grid { grid-template-columns: 1fr; }
  .photo-preview { grid-template-columns: repeat(4,1fr); }
}
</style>