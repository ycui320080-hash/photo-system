<script setup lang="ts">
import { desktopAvailable, importLocal } from '../services/local-file.service';
import { uploadPhotos } from '../services/photo-import.service';
import { ref, watch, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import { api, photoUrl } from '../services/api';
import { useData } from '../composables/useData';
const props = defineProps<{ mode: 'import' | 'selection' | 'delivery' }>();
const { data, error, reload } = useData(() => api('/orders'), []);
const orderId = ref(''),
  current = ref<any>(null),
  busy = ref(false);
const urls = ref<Record<string, string>>({});
watch(orderId, async (id) => {
  for (const u of Object.values(urls.value)) URL.revokeObjectURL(u);
  urls.value = {};
  current.value = data.value.find((o: any) => o.id === id);
  for (const p of props.mode==='delivery'?(current.value?.delivery||[]):(current.value?.photos||[])) {
    try {
      urls.value[p.id] = await photoUrl(p.id);
    } catch (e) {
      ElMessage.error((e as Error).message);
    }
  }
});
onBeforeUnmount(() => Object.values(urls.value).forEach(URL.revokeObjectURL));
async function upload(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files?.length || !orderId.value) return;
  busy.value = true;
  try {
    current.value = await uploadPhotos(
      orderId.value,
      Array.from(input.files),
      props.mode === 'delivery' ? 'delivery' : 'preview',
    );
    await reload();
    await loadImages();ElMessage.success('照片已处理并保存');
  } catch (e) {
    ElMessage.error((e as Error).message);
  } finally {
    busy.value = false;
    input.value = '';
  }
}
async function reopen() {
  try {
    current.value = await api('/orders/' + orderId.value + '/reopen', 'POST', {});
    ElMessage.success('已重新开放选片');
  } catch (e) {
    ElMessage.error((e as Error).message);
  }
}
async function retouch(photoId: string) {
  try {
    await api('/orders/' + orderId.value + '/retouch', 'POST', { photoId, done: true });
    ElMessage.success('已标记修图完成');
  } catch (e) {
    ElMessage.error((e as Error).message);
  }
}
async function exportSelection() {
  try {
    await api('/export');
    const rows = current.value.photos
      .filter((p: any) => p.selected)
      .map((p: any) => ({ number: p.number, note: p.note }));
    const u = URL.createObjectURL(new Blob([JSON.stringify(rows, null, 2)]));
    const a = document.createElement('a');
    a.href = u;
    a.download = 'selection-' + orderId.value + '.json';
    a.click();
    URL.revokeObjectURL(u);
  } catch (e) {
    ElMessage.error((e as Error).message);
  }
}
async function importNative() {
  busy.value = true;
  try {
    const r = await importLocal(orderId.value, props.mode === 'delivery' ? 'delivery' : 'preview');
    if (!r.cancelled) {
      await reload();
      current.value = data.value.find((o: any) => o.id === orderId.value);
      const failed=r.jobs?.filter(j=>j.status==='failed').length||0;if(failed)ElMessage.warning(failed+'张照片未上传成功，请在系统设置中重试');else ElMessage.success('照片已导入并记录原图位置');await loadImages();
    }
  } catch (e) {
    ElMessage.error((e as Error).message);
  } finally {
    busy.value = false;
  }
}
async function loadImages(){for(const u of Object.values(urls.value))if(u.startsWith('blob:'))URL.revokeObjectURL(u);urls.value={};const photos=props.mode==='delivery'?(current.value?.delivery||[]):(current.value?.photos||[]);for(const p of photos){try{urls.value[p.id]=await photoUrl(p.id)}catch(e){ElMessage.error((e as Error).message)}}}</script>
<template>
  <p class="error">{{ error }}</p>
  <div class="card" v-loading="busy">
    <el-select v-model="orderId" placeholder="选择订单"
      ><el-option
        v-for="o in data"
        :key="o.id"
        :value="o.id"
        :label="o.id + ' · ' + o.packageName + ' · ' + o.status" /></el-select
    ><template v-if="current"
      ><p>
        精修包含 {{ current.retouchCount }} 张 · 已选
        {{ current.photos.filter((p: any) => p.selected).length }} 张 ·
        {{ current.selectionLocked ? '选片已锁定' : '可选片' }}
      </p>
      <template v-if="mode !== 'selection'"
        ><p>
          {{
            mode === 'delivery'
              ? '上传精修成片，文件按设置天数到期'
              : '选择本地照片，服务将生成带水印的压缩预览。原图不会移动或删除。'
          }}
        </p>
        <el-button v-if="desktopAvailable()" @click="importNative"
          >从电脑导入并记录原图位置</el-button
        ><input
          v-else
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          @change="upload"
        />
        <p class="sub">每批最多20张，单张10MB；失败后可重新选择重试。</p></template
      ><el-button v-if="mode === 'selection'" @click="reopen">重新开放选片</el-button
      ><el-button v-if="mode === 'selection'" @click="exportSelection">导出选片清单</el-button>
      <p v-if="mode==='delivery'">顾客确认：{{current.confirmed?'已确认':'待确认'}}</p><p v-if="current.revision">修改意见：{{ current.revision }}</p>
      <div class="grid">
        <div class="photo card" v-for="p in mode==='delivery'?(current.delivery||[]):current.photos" :key="p.id">
          <img v-if="urls[p.id]" :src="urls[p.id]" />
          <p>{{ p.number }} · {{ p.selected ? '已选精修' : '未选择' }}</p>
          <p>{{ p.note || '暂无修图要求' }}</p>
          <el-button v-if="p.selected" @click="retouch(p.id)">标记修图完成</el-button>
        </div>
      </div></template
    ><el-empty v-else description="请选择需要处理的订单" />
  </div>
</template>
