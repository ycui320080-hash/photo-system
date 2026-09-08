<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { api } from '../../services/api';
import { fileUrl } from '../../services/photo-file.service';
import PhotoGrid from '../../components/photo-grid/Index.vue';
const order = ref<any>(null),
  selected = ref<string[]>([]),
  notes = ref<Record<string, string>>({}),
  urls = ref<Record<string, string>>({}),
  error = ref(''),
  busy = ref(false);
onLoad(async (q) => {
  try {
    order.value = await api('/orders/' + q?.id);
    for (const p of order.value.photos) urls.value[p.id] = await fileUrl(p.id);
  } catch (e) {
    error.value = (e as Error).message;
  }
});
function toggle(id: string) {
  if (order.value.selectionLocked) return;
  selected.value = selected.value.includes(id)
    ? selected.value.filter((x) => x !== id)
    : [...selected.value, id];
}
function submit() {
  uni.showModal({
    title: '确认提交选片',
    content: '提交后将锁定，如需更改请联系门店。',
    success: async (r) => {
      if (!r.confirm || busy.value) return;
      busy.value = true;
      try {
        order.value = await api('/orders/' + order.value.id + '/selection', 'POST', {
          photos: selected.value.map((id) => ({ id, note: notes.value[id] || '' })),
        });
        uni.showToast({ title: '选片已提交' });
      } catch (e) {
        error.value = (e as Error).message;
      } finally {
        busy.value = false;
      }
    },
  });
}
async function favorite(photoId: string) {
  try {
    order.value = await api('/orders/' + order.value.id + '/favorite', 'POST', {
      photoId,
      favorite: !order.value.photos.find((p: any) => p.id === photoId).favorite,
    });
  } catch (e) {
    error.value = (e as Error).message;
  }
}
</script>
<template>
  <view class="page"
    ><view class="title">选出你最喜欢的自己。</view><view class="error">{{ error }}</view
    ><template v-if="order"
      ><view class="subtitle"
        >套餐包含 {{ order.retouchCount }} 张 · 已选择 {{ selected.length }} 张<br />{{
          order.selectionLocked ? '选片已锁定，请等待修图' : '以下均为带水印预览图'
        }}</view
      ><view class="row" v-for="p in order.photos" :key="p.id"
        ><text>{{ p.number }}</text
        ><button class="secondary" @click="favorite(p.id)">
          {{ p.favorite ? '★ 已收藏' : '☆ 收藏' }}
        </button></view
      ><PhotoGrid :photos="order.photos" :urls="urls" :selected="selected" @toggle="toggle" /><view
        class="card"
        v-for="id in selected"
        :key="id"
        ><view>{{ order.photos.find((p: any) => p.id === id)?.number }} 的修图要求</view
        ><textarea v-model="notes[id]" placeholder="自然肤色、保留痣等" /></view
      ><button
        :disabled="order.selectionLocked || busy || !selected.length"
        :loading="busy"
        @click="submit"
      >
        确认选片</button
      ><view v-if="!order.photos.length">预览图尚未上传</view></template
    ></view
  >
</template>
