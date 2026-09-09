<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { api, photoUrl } from '../../services/api';
import { useData } from '../../composables/useData';
const { data, error, reload } = useData(() => api('/orders'), []);
const rows = computed(() => data.value.filter((o: any) => ['待打印', '待取件'].includes(o.status)));
const printers = ref<{ name: string; status: number; isDefault: boolean }[]>([]);
const printerName = ref('');
const printingId = ref('');
const studio = (window as any).studio;
async function connectPrinter() {
  if (!studio?.listPrinters) {
    ElMessage.warning('打印功能需要在管理端客户端内使用');
    return;
  }
  try {
    printers.value = await studio.listPrinters();
    if (!printers.value.length) {
      ElMessage.warning('未检测到系统打印机,请先安装打印机驱动');
      return;
    }
    if (!printers.value.some((p) => p.name === printerName.value))
      printerName.value = (printers.value.find((p) => p.isDefault) || printers.value[0]).name;
    ElMessage.success('已连接,检测到 ' + printers.value.length + ' 台打印机');
  } catch (e) {
    ElMessage.error((e as Error).message);
  }
}
async function toDataUrl(url: string) {
  const blob = await (await fetch(url)).blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(Error('照片读取失败'));
    reader.readAsDataURL(blob);
  });
}
async function printOrder(o: any) {
  if (!studio?.printPhotos) {
    ElMessage.warning('打印功能需要在管理端客户端内使用');
    return;
  }
  if (!printerName.value) {
    ElMessage.warning('请先点击「连接打印机」并选择打印机');
    return;
  }
  const selected = (o.photos || []).filter((p: any) => p.selected);
  const list = selected.length ? selected : o.photos || [];
  if (!list.length) {
    ElMessage.warning('该订单暂无可打印照片');
    return;
  }
  printingId.value = o.id;
  try {
    const dataUrls: string[] = [];
    for (const p of list) dataUrls.push(await toDataUrl(await photoUrl(p.id)));
    const spec =
      (o.print?.size || '按套餐') + ' · ' + (o.print?.paper || '标准') + (o.print?.laminate ? ' · 过塑' : '');
    const html =
      '<!doctype html><meta charset="utf-8"><style>@page{margin:10mm}body{margin:0;font-family:Microsoft YaHei,sans-serif;color:#25231f}.sheet{page-break-after:always;text-align:center}.sheet:last-child{page-break-after:auto}.meta{margin-bottom:6px;font-size:12px;color:#756f65}img{max-width:100%;max-height:245mm}</style>' +
      dataUrls
        .map(
          (src, i) =>
            `<div class="sheet"><div class="meta">订单 ${o.id} · ${spec} · 第 ${i + 1}/${dataUrls.length} 张${
              o.pickupCode ? ' · 取件码 ' + o.pickupCode : ''
            }</div><img src="${src}"></div>`,
        )
        .join('');
    const result = await studio.printPhotos({
      html,
      deviceName: printerName.value,
      copies: o.print?.quantity || 1,
    });
    if (result && result.success === false) {
      ElMessage.error('打印未完成:' + (result.reason || '未知原因'));
    } else {
      ElMessage.success('已发送到打印机「' + printerName.value + '」');
      if (o.status === '待打印') await start(o);
    }
  } catch (e) {
    ElMessage.error((e as Error).message);
  }
  printingId.value = '';
}
async function advance(o: any) {
  try {
    await api('/orders/' + o.id, 'PATCH', { status: o.status === '待打印' ? '待取件' : '已完成' });
    await reload();
    ElMessage.success('任务已更新');
  } catch (e) {
    ElMessage.error((e as Error).message);
  }
}
async function start(o: any) {
  try {
    await api('/orders/' + o.id + '/printing', 'POST', {});
    await reload();
    ElMessage.success('已标记打印中');
  } catch (e) {
    ElMessage.error((e as Error).message);
  }
}
</script>
<template>
  <h1>打印任务</h1>
  <p class="sub">连接本机打印机后可直接打印订单照片，打印完成再推进取件进度。</p>
  <p class="error">{{ error }}</p>
  <div class="toolbar">
    <el-button type="primary" @click="connectPrinter">连接打印机</el-button>
    <el-select
      v-if="printers.length"
      v-model="printerName"
      class="printer-select"
      placeholder="选择打印机"
    >
      <el-option
        v-for="p in printers"
        :key="p.name"
        :value="p.name"
        :label="(p.isDefault ? '★ ' : '') + p.name"
      />
    </el-select>
    <el-button v-if="printers.length" text @click="connectPrinter">刷新</el-button>
    <span class="printer-tip">{{ printers.length ? '检测到 ' + printers.length + ' 台打印机' : '尚未连接打印机,打印前请先连接' }}</span>
  </div>
  <div class="card">
    <el-table :data="rows" empty-text="暂无待打印或待取件任务"
      ><el-table-column prop="id" label="订单号" /><el-table-column
        prop="packageName"
        label="项目"
      /><el-table-column prop="status" label="状态" /><el-table-column label="打印规格"
        ><template #default="s"
          >{{ s.row.print?.size || '按套餐' }} · {{ s.row.print?.quantity || 1 }} 份 ·
          {{ s.row.print?.paper || '标准' }} · {{ s.row.photos.length }} 张</template
        ></el-table-column
      ><el-table-column prop="pickupCode" label="取件码" /><el-table-column label="操作"
        ><template #default="s"
          ><el-button
            v-if="s.row.status === '待打印'"
            :loading="printingId === s.row.id"
            type="primary"
            plain
            @click="printOrder(s.row)"
            >打印照片</el-button
          ><el-button v-if="s.row.status === '待打印'" @click="start(s.row)">标记打印中</el-button
          ><el-button @click="advance(s.row)">{{
            s.row.status === '待打印' ? '打印完成' : '已取件'
          }}</el-button></template
        ></el-table-column
      ></el-table
    >
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  margin-bottom: 14px;
  align-items: center;
  gap: 10px;
}
.printer-select {
  width: 280px;
}
.printer-tip {
  color: #9a9284;
  font-size: 13px;
}
</style>
