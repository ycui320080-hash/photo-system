<script setup lang="ts">
const platform = uni;
import { ref, reactive, watch } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { api } from '../../services/api';
import { useData } from '../../composables/useData';
const { data: packages } = useData(() => api('/packages'));
const form = reactive({
  packageId: 'p0',
  date: new Date(Date.now() + 86400000).toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' }),
  time: '',
  name: '演示同学',
  phone: '00000000000',
  people: 1,
  note: '',
  requestId: Date.now() + '-' + Math.random(),
});
const slots = ref<any[]>([]),
  busy = ref(false),
  error = ref(''),
  success = ref<any>(null);
onLoad((q) => {
  if (q?.packageId) form.packageId = q.packageId;
  loadSlots();
});
async function loadSlots() {
  try {
    slots.value = await api('/slots?date=' + form.date);
    form.time = '';
  } catch (e) {
    error.value = (e as Error).message;
  }
}
watch(() => form.date, loadSlots);
async function submit() {
  if (busy.value) return;
  busy.value = true;
  error.value = '';
  try {
    success.value = await api('/bookings', 'POST', form);
  } catch (e) {
    error.value = (e as Error).message;
    await loadSlots();
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <view class="page"
    ><template v-if="success"
      ><view class="title">预约成功 ✓</view
      ><view class="card"
        ><view>{{ success.packageName }}</view
        ><view>订单编号 {{ success.id }}</view
        ><view class="muted">到店付款 · 取件码 {{ success.pickupCode }}</view></view
      ><button @click="platform.switchTab({ url: '/pages/orders/index' })">
        查看我的订单
      </button></template
    ><template v-else
      ><view class="title">为自己，留一个时间。</view
      ><view class="subtitle">到店付款 · 提前 2 小时可取消未付款预约</view
      ><view class="card"
        ><picker
          :range="packages"
          range-key="name"
          @change="form.packageId = packages[Number($event.detail.value)].id"
          >套餐：{{
            packages.find((p: any) => p.id === form.packageId)?.name || '请选择'
          }}
          ▾</picker
        ><picker mode="date" :value="form.date" @change="form.date = $event.detail.value"
          >日期：{{ form.date }}</picker
        ><view class="grid"
          ><view
            v-for="s in slots"
            :key="s.time"
            class="pill"
            :style="{ background: form.time === s.time ? '#e3bc95' : '' }"
            @click="s.remaining >= form.people && (form.time = s.time)"
            >{{ s.time }} · 余 {{ s.remaining }} 人</view
          ></view
        ><input v-model="form.name" placeholder="姓名" /><input
          v-model="form.phone"
          type="number"
          placeholder="手机号（演示使用11个0）"
        /><input v-model.number="form.people" type="number" placeholder="人数" /><textarea
          v-model="form.note"
          placeholder="想告诉摄影师的话"
        /><view class="error">{{ error }}</view
        ><button :loading="busy" :disabled="busy || !form.time" @click="submit">
          确认预约 · 到店付款
        </button></view
      ></template
    ></view
  >
</template>
