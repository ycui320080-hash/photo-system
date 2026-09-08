<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { api } from '../services/api';
const sync = ref<any>(null);
function download(data: unknown) {
  const u = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
  );
  const a = document.createElement('a');
  a.href = u;
  a.download = 'studio-backup-' + Date.now() + '.json';
  a.click();
  URL.revokeObjectURL(u);
}
async function backup() {
  try {
    download(await api('/backup'));
  } catch (e) {
    ElMessage.error((e as Error).message);
  }
}
async function restore(e: Event) {
  try {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    const snapshot = JSON.parse(await f.text());
    const count = Object.values(snapshot.collections || {}).reduce(
      (n: any, r: any) => n + r.length,
      0,
    );
    await ElMessageBox.confirm(
      '从 ' + f.name + ' 合并恢复 ' + count + ' 条记录，同ID记录将覆盖。恢复前自动保存数据库快照。',
      '确认具体恢复目标',
    );
    await api('/restore', 'POST', { snapshot, confirm: true });
    ElMessage.success('恢复完成');
  } catch (e) {
    if (e !== 'cancel') ElMessage.error((e as Error).message);
  }
}
async function cleanup() {
  try {
    const rows = await api('/expired-files');
    if (!rows.length) {
      ElMessage.info('没有可安全清理的过期文件');
      return;
    }
    await ElMessageBox.confirm(
      '仅清理以下已结束订单的过期副本：' + rows.map((p: any) => p.id).join('、'),
      '确认文件清理',
    );
    await api('/expired-files/cleanup', 'POST', { ids: rows.map((p: any) => p.id), confirm: true });
    ElMessage.success('清理完成');
  } catch (e) {
    if (e !== 'cancel') ElMessage.error((e as Error).message);
  }
}
async function check() {
  try {
    sync.value = await api('/sync');
  } catch (e) {
    ElMessage.error((e as Error).message);
  }
}
</script>
<template>
  <div class="card">
    <h2>备份与同步</h2>
    <el-button @click="backup">导出数据备份</el-button
    ><label>恢复备份 <input type="file" accept="application/json" @change="restore" /></label>
    <p class="sub">JSON备份包含订单隐私数据，请妥善保存；照片副本需另行备份 .data/files。</p>
    <el-button @click="check">检查同步状态</el-button
    ><el-button @click="cleanup">检查过期文件</el-button>
    <p v-if="sync">
      {{ sync.mode }} / {{ sync.database }} ·
      {{ sync.cloudConnected ? '云端已连接' : '本地模式，未连接云端' }} · 索引
      {{ sync.localFiles }} 张
    </p>
  </div>
</template>
