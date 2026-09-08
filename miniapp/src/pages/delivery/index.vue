<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { api } from '../../services/api';
import { fileUrl } from '../../services/photo-file.service';
import { chinaTime } from '../../../../shared/utils/format';
const order = ref<any>(null),
  urls = ref<Record<string, string>>({}),
  revision = ref(''),
  error = ref('');
onLoad(async (q) => {
  try {
    order.value = await api('/orders/' + q?.id);
    for (const p of order.value.delivery || [])
      if (Date.parse(p.expiresAt) > Date.now()) urls.value[p.id] = await fileUrl(p.id);
  } catch (e) {
    error.value = (e as Error).message;
  }
});
async function confirm(feedback = false) {
  try {
    order.value = await api('/orders/' + order.value.id + '/confirm', 'POST', {
      revision: feedback ? revision.value : '',
    });
    uni.showToast({ title: feedback ? '意见已提交' : '已确认成片' });
  } catch (e) {
    error.value = (e as Error).message;
  }
}
async function download(id: string) {
  try {
    const url = await fileUrl(id);
    // #ifdef H5
    const a = document.createElement('a');
    a.href = url;
    a.download = id + '.jpg';
    a.click();
    // #endif
    // #ifdef MP-WEIXIN
    uni.saveImageToPhotosAlbum({
      filePath: url,
      fail: () => uni.showToast({ title: '请允许保存到相册', icon: 'none' }),
    });
    // #endif
  } catch (e) {
    error.value = (e as Error).message;
  }
}
</script>
<template>
  <view class="page"
    ><view class="title">你的照片，准备好了。</view
    ><view class="subtitle">请在到期前保存，过期文件无法下载。</view
    ><view class="error">{{ error }}</view
    ><template v-if="order"
      ><view v-for="p in order.delivery || []" :key="p.id" class="card"
        ><image v-if="urls[p.id]" :src="urls[p.id]" mode="widthFix" style="width: 100%" /><view
          class="muted"
          >到期：{{ chinaTime(p.expiresAt) }}</view
        ><button :disabled="Date.parse(p.expiresAt) <= Date.now()" @click="download(p.id)">
          保存最终成片
        </button></view
      ><view v-if="!order.delivery?.length">成片尚未交付</view
      ><template v-if="order.status === '待顾客确认'">
        <textarea
          v-if="!order.revision"
          v-model="revision"
          placeholder="可提交一次修改意见"
        /><button
          v-if="!order.revision"
          class="secondary"
          :disabled="!revision.trim()"
          @click="confirm(true)"
        >
          提交修改意见</button
        ><button @click="confirm()">确认成片</button></template
      ></template
    ></view
  >
</template>
