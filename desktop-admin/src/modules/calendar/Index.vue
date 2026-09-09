<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { api } from '../../services/api';
import { useData } from '../../composables/useData';
import { chinaTime } from '../../../../shared/utils/format';
const date = ref(new Date()),
  view = ref('月视图'),
  edit = ref<any>(null),
  selectedDay = ref<string | null>(null);
const { data, error, reload } = useData(() => api('/orders'), []);
const active = computed(() => data.value.filter((o: any) => o.status !== '已取消'));
const dayKey = (d: Date | string | number) => new Date(d).toLocaleDateString('sv-SE');
const countByDay = computed(() => {
  const map: Record<string, number> = {};
  for (const o of active.value) {
    const t = Date.parse(o.appointment);
    if (Number.isNaN(t)) continue;
    const key = dayKey(t);
    map[key] = (map[key] || 0) + 1;
  }
  return map;
});
const rows = computed(() =>
  selectedDay.value
    ? active.value.filter((o: any) => dayKey(o.appointment) === selectedDay.value)
    : [],
);
watch(date, (d) => (selectedDay.value = dayKey(d)));
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
  <p class="sub">容量、营业时间与停业日可在系统设置调整。点击日期查看当天预约。</p>
  <el-radio-group v-model="view"
    ><el-radio-button v-for="v in ['日视图', '周视图', '月视图']" :key="v" :value="v">{{
      v
    }}</el-radio-button></el-radio-group
  ><el-date-picker v-model="date" :clearable="false" />
  <p class="error">{{ error }}</p>
  <div class="card">
    <el-calendar v-if="view === '月视图'" v-model="date">
      <template #date-cell="{ data }">
        <div class="cell" :class="{ selected: data.day === selectedDay }">
          <span class="cell-num">{{ Number(data.day.slice(8)) }}</span>
          <span v-if="countByDay[data.day]" class="cell-badge"
            >{{ countByDay[data.day] }} 预约</span
          >
        </div>
      </template>
    </el-calendar>
    <el-table v-if="selectedDay" :data="rows" empty-text="该日暂无预约"
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
                date: dayKey(s.row.appointment),
                time: new Date(s.row.appointment).toTimeString().slice(0, 5),
              }
            "
            >改期</el-button
          ></template
        ></el-table-column
      ></el-table
    >
    <p v-else class="pick-hint">在日历上点击某一天,下方将显示该日的预约单。</p>
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

<style scoped>
.cell {
  display: flex;
  height: 100%;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
}
.cell.selected .cell-num {
  font-weight: 700;
}
.cell-badge {
  padding: 0 6px;
  border-radius: 999px;
  background: #b64032;
  color: #fff;
  font-size: 12px;
  line-height: 20px;
}
.pick-hint {
  margin: 24px 0;
  color: #9a9284;
  text-align: center;
}
</style>
