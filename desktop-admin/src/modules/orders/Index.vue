<script setup lang="ts">
import OfflineOrder from '../../components/OfflineOrder.vue';
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { api } from '../../services/api';
import { useData } from '../../composables/useData';
import { statuses } from '../../../../shared/constants/order-status';
import { money, chinaTime } from '../../../../shared/utils/format';
import StatusTag from '../../components/order-status-tag/Index.vue';
const { data, busy, error, reload } = useData(() => api('/orders'), []);
const query = ref(''),
  filter = ref(''),
  selected = ref<any>(null);
const rows = computed(() =>
  data.value.filter(
    (o: any) =>
      (!filter.value || o.status === filter.value) &&
      [o.name, o.phone, o.id, o.pickupCode].join(' ').includes(query.value),
  ),
);
async function save() {
  try {
    await api('/orders/' + selected.value.id, 'PATCH', {
      status: selected.value.nextStatus || undefined,
      paid: selected.value.paid,
      internalNote: selected.value.internalNote,
    });
    selected.value = null;
    await reload();
    ElMessage.success('订单已更新');
  } catch (e) {
    ElMessage.error((e as Error).message);
  }
}
async function exportData() {
  try {
    const d = await api('/export');
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.json';
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    ElMessage.error((e as Error).message);
  }
}
</script>
<template>
  <h1>订单管理</h1>
  <p class="sub">每一笔订单，都有迹可循。</p>
  <div class="toolbar">
    <OfflineOrder @created="reload" /><el-input
      v-model="query"
      placeholder="姓名 / 手机 / 订单号 / 取件码"
    /><el-select v-model="filter" clearable placeholder="全部状态"
      ><el-option v-for="s in statuses" :key="s" :value="s" :label="s" /></el-select
    ><el-button @click="reload">刷新</el-button><el-button @click="exportData">导出</el-button>
  </div>
  <el-alert v-if="error" :title="error" type="error" />
  <div class="card">
    <el-table v-loading="busy" :data="rows" empty-text="暂无订单"
      ><el-table-column prop="id" label="订单编号" min-width="200" /><el-table-column
        prop="name"
        label="顾客"
      /><el-table-column prop="packageName" label="套餐" /><el-table-column label="状态"
        ><template #default="s"><StatusTag :status="s.row.status" /></template></el-table-column
      ><el-table-column label="金额"
        ><template #default="s">¥{{ money(s.row.amount) }}</template></el-table-column
      ><el-table-column label="操作"
        ><template #default="s"
          ><el-button text @click="selected = JSON.parse(JSON.stringify(s.row))"
            >处理</el-button
          ></template
        ></el-table-column
      ></el-table
    >
  </div>
  <el-dialog :model-value="!!selected" title="订单详情与处理" @close="selected = null"
    ><template v-if="selected"
      ><p>{{ selected.id }} · {{ selected.phone }} · 取件码 {{ selected.pickupCode }}</p>
      <p>预约：{{ chinaTime(selected.appointment) }}</p>
      <el-form label-width="120px"
        ><el-form-item label="推进状态"
          ><el-select v-model="selected.nextStatus"
            ><el-option
              v-for="s in statuses"
              :key="s"
              :value="s"
              :label="s" /></el-select></el-form-item
        ><el-form-item label="累计收款（分）"
          ><el-input-number v-model="selected.paid" :min="0" :max="selected.amount" /></el-form-item
        ><el-form-item label="内部备注"
          ><el-input v-model="selected.internalNote" type="textarea" /></el-form-item></el-form
      ><el-timeline
        ><el-timeline-item
          v-for="(h, i) in selected.history"
          :key="i"
          :timestamp="chinaTime(h.at)"
          >{{ h.status }}</el-timeline-item
        ></el-timeline
      ><el-button type="primary" @click="save">保存</el-button></template
    ></el-dialog
  >
</template>
