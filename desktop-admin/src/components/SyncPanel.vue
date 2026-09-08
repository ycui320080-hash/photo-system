<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { desktopAvailable, retryLocal, type SyncJob } from '../services/local-file.service';
const jobs = ref<SyncJob[]>([]),
  directory = ref(''),
  busy = ref(false);
async function refresh() {
  if (window.studio) {
    const s = await window.studio.syncStatus();
    jobs.value = s.jobs;
    directory.value = s.directory;
  }
}
async function retry() {
  busy.value = true;
  try {
    jobs.value = (await retryLocal()).jobs;
    ElMessage.success('重试已执行，请查看各文件状态');
  } catch (e) {
    ElMessage.error((e as Error).message);
  } finally {
    busy.value = false;
  }
}
async function choose() {
  directory.value = await window.studio!.chooseDirectory();
}
onMounted(refresh);
</script>
<template>
  <div v-if="desktopAvailable()" class="card">
    <h2>本地照片同步队列</h2>
    <el-button @click="refresh">刷新</el-button
    ><el-button :loading="busy" @click="retry">重试未完成上传</el-button
    ><el-button @click="choose">选择默认照片目录</el-button>
    <p>{{ directory || '尚未设置默认目录' }}</p>
    <el-table :data="jobs" empty-text="暂无上传任务"
      ><el-table-column prop="name" label="文件" /><el-table-column
        prop="status"
        label="状态" /><el-table-column prop="attempts" label="尝试次数" /><el-table-column
        prop="last_error"
        label="错误原因"
    /></el-table>
  </div>
</template>
