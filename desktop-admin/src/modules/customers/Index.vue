<script setup lang="ts">
import { api } from '../../services/api';
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { listCustomers, exportCustomers, saveCustomerNote } from '../../services/customer.service';
import { useData } from '../../composables/useData';
import { money, chinaTime } from '../../../../shared/utils/format';
const { data, error } = useData(listCustomers, []);
const selected = ref<any>(null),
  note = ref('');
async function save() {
  try {
    await saveCustomerNote(selected.value.id, note.value);
    ElMessage.success('备注已保存');
  } catch (e) {
    ElMessage.error((e as Error).message);
  }
}
async function exportData() {
  try {
    const rows = await exportCustomers();
    const url = URL.createObjectURL(new Blob([JSON.stringify(rows, null, 2)]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.json';
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    ElMessage.error((e as Error).message);
  }
}
async function openCustomer(row: any) {
  selected.value = row;
  try {
    note.value = (await api('/customers/' + row.id)).note;
  } catch (e) {
    ElMessage.error((e as Error).message);
  }
}
</script>
<template>
  <h1>顾客管理</h1>
  <p class="sub">从订单汇总，手机号默认脱敏。</p>
  <el-button @click="exportData">导出顾客</el-button>
  <p class="error">{{ error }}</p>
  <div class="card">
    <el-table :data="data" empty-text="暂无顾客"
      ><el-table-column prop="name" label="顾客" /><el-table-column
        prop="phone"
        label="手机号"
      /><el-table-column prop="count" label="历史订单" /><el-table-column label="累计实收"
        ><template #default="s">¥{{ money(s.row.paid) }}</template></el-table-column
      ><el-table-column label="最近预约"
        ><template #default="s">{{ chinaTime(s.row.lastVisit) }}</template></el-table-column
      ><el-table-column label="操作"
        ><template #default="s"
          ><el-button @click="openCustomer(s.row)">查看详情</el-button></template
        ></el-table-column
      ></el-table
    >
  </div>
  <el-dialog :model-value="!!selected" title="顾客历史" @close="selected = null"
    ><template v-if="selected"
      ><p v-for="o in selected.orders" :key="o.id">
        {{ o.id }} · {{ o.packageName }} · {{ o.status }}
      </p>
      <el-input v-model="note" type="textarea" placeholder="顾客备注" /><el-button @click="save"
        >保存备注</el-button
      ></template
    ></el-dialog
  >
</template>
