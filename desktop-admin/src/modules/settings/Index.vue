<script setup lang="ts">
import SyncPanel from '../../components/SyncPanel.vue';
import BackupPanel from '../../components/BackupPanel.vue';
import { ElMessage } from 'element-plus';
import { useData } from '../../composables/useData';
import { api } from '../../services/api';
const { data, error } = useData(() => api('/settings'), {});
async function save() {
  try {
    await api('/settings', 'PUT', data.value);
    ElMessage.success('设置已保存');
  } catch (e) {
    ElMessage.error((e as Error).message);
  }
}
</script>
<template>
  <h1>系统设置</h1>
  <p class="sub">门店信息与文件保留规则</p>
  <p class="error">{{ error }}</p>
  <div class="card">
    <el-form label-width="150px"
      ><el-form-item
        v-for="(label, key) in {
          name: '门店名称',
          address: '地址',
          phone: '联系电话',
          hours: '营业时间（整点）',
          watermark: '水印文字',
          closedDates: '停业日期（逗号分隔）',
        }"
        :key="key"
        :label="label"
        ><el-input v-model="data[key]" /></el-form-item
      ><el-form-item
        v-for="(label, key) in {
          retentionDays: '文件保存天数',
          capacity: '每时段人数',
          previewQuality: '预览图质量',
        }"
        :key="key"
        :label="label"
        ><el-input-number v-model="data[key]" :min="1" :max="100" /></el-form-item
      ><el-form-item label="门店纬度"
        ><el-input-number
          v-model="data.latitude"
          :min="-90"
          :max="90"
          :precision="6" /></el-form-item
      ><el-form-item label="门店经度"
        ><el-input-number
          v-model="data.longitude"
          :min="-180"
          :max="180"
          :precision="6" /></el-form-item
      ><el-button type="primary" @click="save">保存设置</el-button></el-form
    >
    <p class="sub">备份：停止 API 后复制 .data 目录；原图请独立备份。详细恢复步骤见 README。</p>
  </div>
  <BackupPanel /><SyncPanel />
</template>
