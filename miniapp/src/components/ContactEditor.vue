<script setup lang="ts">
import { ref } from 'vue';
import { api } from '../services/api';
import { useData } from '../composables/useData';
const { data, error, reload } = useData(() => api('/profile'), { contacts: [] });
const name = ref(''),
  phone = ref('');
async function save() {
  if (!name.value.trim() || (!/^1[3-9]\d{9}$/.test(phone.value) && phone.value !== '00000000000')) {
    error.value = '请填写联系人和手机号';
    return;
  }
  try {
    await api('/profile', 'POST', {
      contacts: [...(data.value.contacts || []), { name: name.value, phone: phone.value }].slice(
        0,
        10,
      ),
    });
    name.value = '';
    phone.value = '';
    await reload();
  } catch (e) {
    error.value = (e as Error).message;
  }
}
</script>
<template>
  <view class="card"
    ><view class="section">常用联系人</view
    ><view v-for="(c, i) in data.contacts || []" :key="i"
      >{{ c.name }} · {{ c.phone.slice(0, 3) }}****{{ c.phone.slice(-4) }}</view
    ><input v-model="name" placeholder="联系人姓名" /><input
      v-model="phone"
      placeholder="联系电话"
    /><button class="secondary" @click="save">保存联系人</button
    ><view class="error">{{ error }}</view></view
  >
</template>
