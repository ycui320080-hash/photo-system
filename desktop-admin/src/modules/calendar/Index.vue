<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { api } from '../../services/api';
import { useData } from '../../composables/useData';
import { chinaTime } from '../../../../shared/utils/format';
const date = ref(new Date()),
  view = ref('月视图'),
  edit = ref<any>(null);
const { data, error, reload } = useData(() => api('/orders'), []);
const rows = computed(() => {
  const selected = new Date(date.value);
  selected.setHours(0, 0, 0, 0);
  let start = selected.getTime(),
    end = start + 86400000;
  if (view.value === '周视图') {
    start -= ((selected.getDay() + 6) % 7) * 86400000;
    end = start + 7 * 86400000;
  }
  if (view.value === '月视图') {
    start = new Date(selected.getFullYear(), selected.getMonth(), 1).getTime();
    end = new Date(selected.getFullYear(), selected.getMonth() + 1, 1).getTime();
  }
  return data.value.filter(
    (o: any) => Date.parse(o.appointment) >= start && Date.parse(o.appointment) < end,
  );
});
async function save() {
  try {
    await api('/orders/' + edit.value.id + '/reschedule', 'POST', {
      date: edit.value.date,
      time: edit.value.time,
    });
    edit.value = null;
    await reload();
    ElMessage.success('预约已改期');
  } catch (e) {
    ElMessage.error((e as Error).message);
  }
}
</script>
<template>
  <h1>预约日历</h1>
  <p class="sub">容量、营业时间与停业日可在系统设置调整。</p>
  <el-radio-group v-model="view"
    ><el-radio-button v-for="v in ['日视图', '周视图', '月视图']" :key="v" :value="v">{{
      v
    }}</el-radio-button></el-radio-group
  ><el-date-picker v-model="date" :clearable="false" />
  <p class="error">{{ error }}</p>
  <div class="card">
    <el-calendar v-if="view === '月视图'" v-model="date" /><el-table
      :data="rows"
      empty-text="该时段暂无预约"
      ><el-table-column prop="name" label="顾客" /><el-table-column
        prop="packageName"
        label="套餐"
      /><el-table-column label="时间"
        ><template #default="s">{{ chinaTime(s.row.appointment) }}</template></el-table-column
      ><el-table-column prop="people" label="人数" /><el-table-column label="操作"
        ><template #default="s"
          ><el-button
            @click="
              edit = {
                id: s.row.id,
                date: new Date(s.row.appointment).toLocaleDateString('sv-SE'),
                time: '10:00',
              }
            "
            >改期</el-button
          ></template
        ></el-table-column
      ></el-table
    >
  </div>
  <el-dialog :model-value="!!edit" title="调整预约" @close="edit = null"
    ><template v-if="edit"
      ><el-date-picker v-model="edit.date" value-format="YYYY-MM-DD" /><el-input
        v-model="edit.time"
        placeholder="10:00"
      /><el-button @click="save">确认改期</el-button></template
    ></el-dialog
  >
</template>
