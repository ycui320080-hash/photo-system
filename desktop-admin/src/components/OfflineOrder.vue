<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { api } from '../services/api';
import { useData } from '../composables/useData';
const emit = defineEmits(['created']);
const visible = ref(false),
  busy = ref(false);
const { data: packages } = useData(() => api('/packages'), []);
const form = reactive({
  packageId: 'p0',
  date: new Date(Date.now() + 86400000).toLocaleDateString('sv-SE'),
  time: '10:00',
  name: '',
  phone: '',
  people: 1,
  note: '',
  requestId: crypto.randomUUID(),
});
async function submit() {
  busy.value = true;
  try {
    await api('/offline-orders', 'POST', form);
    visible.value = false;
    form.requestId = crypto.randomUUID();
    emit('created');
    ElMessage.success('线下订单已创建');
  } catch (e) {
    ElMessage.error((e as Error).message);
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <el-button type="primary" @click="visible = true">创建线下订单</el-button
  ><el-dialog v-model="visible" title="创建线下订单"
    ><el-form label-width="90px"
      ><el-form-item label="套餐"
        ><el-select v-model="form.packageId"
          ><el-option
            v-for="p in packages"
            :key="p.id"
            :value="p.id"
            :label="p.name" /></el-select></el-form-item
      ><el-form-item label="预约日期"
        ><el-date-picker v-model="form.date" value-format="YYYY-MM-DD" /></el-form-item
      ><el-form-item label="时段"><el-input v-model="form.time" placeholder="10:00" /></el-form-item
      ><el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item
      ><el-form-item label="手机"
        ><el-input v-model="form.phone" placeholder="演示用00000000000" /></el-form-item
      ><el-form-item label="人数"
        ><el-input-number v-model="form.people" :min="1" :max="20" /></el-form-item
      ><el-button type="primary" :loading="busy" @click="submit">创建订单</el-button></el-form
    ></el-dialog
  >
</template>
