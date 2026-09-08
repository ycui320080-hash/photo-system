<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { api } from '../../services/api';
import { useData } from '../../composables/useData';
import { money } from '../../../../shared/utils/format';
const { data, error, reload } = useData(() => api('/packages'), []);
const edit = ref<any>(null);
async function save() {
  try {
    await api('/packages/' + edit.value.id, 'PUT', edit.value);
    edit.value = null;
    await reload();
    ElMessage.success('套餐已保存');
  } catch (e) {
    ElMessage.error((e as Error).message);
  }
}
function add() {
  edit.value = {
    id: crypto.randomUUID(),
    name: '',
    category: '校园写真',
    price: 0,
    originalPrice: 0,
    retouchCount: 1,
    duration: 30,
    description: '',
    enabled: true,
    bookingRequired: true,
    sort: 0,
    image: '',
  };
}
</script>
<template>
  <h1>套餐管理</h1>
  <p class="sub">清晰的服务，让预约更简单。</p>
  <el-button type="primary" @click="add">新增套餐</el-button>
  <p class="error">{{ error }}</p>
  <div class="grid">
    <div v-for="p in data" :key="p.id" class="card">
      <p>{{ p.category }} · {{ p.enabled ? '已上架' : '已下架' }}</p>
      <h2>{{ p.name }}</h2>
      <p>¥ {{ money(p.price) }} / 精修 {{ p.retouchCount }} 张</p>
      <el-button @click="edit = { ...p }">编辑套餐</el-button>
    </div>
  </div>
  <el-dialog :model-value="!!edit" title="套餐编辑" @close="edit = null"
    ><el-form v-if="edit" label-width="100px"
      ><el-form-item
        v-for="field in ['name', 'category', 'description', 'image']"
        :key="field"
        :label="
          ({ name: '名称', category: '分类', description: '介绍', image: '图片地址' } as any)[field]
        "
        ><el-input v-model="edit[field]" /></el-form-item
      ><el-form-item
        v-for="field in ['price', 'originalPrice', 'retouchCount', 'duration', 'sort']"
        :key="field"
        :label="
          (
            {
              price: '优惠价（分）',
              originalPrice: '原价（分）',
              retouchCount: '精修张数',
              duration: '时长（分）',
              sort: '排序',
            } as any
          )[field]
        "
        ><el-input-number v-model="edit[field]" :min="0" /></el-form-item
      ><el-form-item label="上架"><el-switch v-model="edit.enabled" /></el-form-item
      ><el-button type="primary" @click="save">保存</el-button></el-form
    ></el-dialog
  >
</template>
