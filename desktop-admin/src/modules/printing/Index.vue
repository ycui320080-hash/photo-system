<script setup lang="ts">
import { computed } from 'vue';
import { ElMessage } from 'element-plus';
import { api } from '../../services/api';
import { useData } from '../../composables/useData';
const { data, error, reload } = useData(() => api('/orders'), []);
const rows = computed(() => data.value.filter((o: any) => ['待打印', '待取件'].includes(o.status)));
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
    ElMessage.success('已标记打印中');
  } catch (e) {
    ElMessage.error((e as Error).message);
  }
}
</script>
<template>
  <h1>打印任务</h1>
  <p class="sub">管理打印与取件进度，打印操作请在打印机软件完成。</p>
  <p class="error">{{ error }}</p>
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
          ><el-button v-if="s.row.status === '待打印'" @click="start(s.row)">开始打印</el-button
          ><el-button @click="advance(s.row)">{{
            s.row.status === '待打印' ? '打印完成' : '已取件'
          }}</el-button></template
        ></el-table-column
      ></el-table
    >
  </div>
</template>
