<script setup lang="ts">
import { useData } from '../../composables/useData';
import { api } from '../../services/api';
import { money } from '../../../../shared/utils/format';
const { data, error, reload } = useData(() => api('/statistics'), {});
</script>
<template>
  <h1>数据统计</h1>
  <p class="sub">仅汇总数据库中的订单与实际收款。</p>
  <el-button @click="reload">刷新统计</el-button>
  <p class="error">{{ error }}</p>
  <el-empty v-if="!data.total" description="暂无经营数据" /><template v-else
    ><div class="metrics">
      <div class="card" v-for="(v, k) in data.periods" :key="k">
        本{{ k }} · {{ v.orders }} 单 · 实收 ¥{{ money(v.revenue) }}
      </div>
    </div>
    <div class="metrics">
      <div class="card metric">
        订单数<b>{{ data.total }}</b>
      </div>
      <div class="card metric">
        实收营业额<b>¥{{ money(data.revenue) }}</b>
      </div>
      <div class="card metric">
        待收款<b>¥{{ money(data.unpaid) }}</b>
      </div>
    </div>
    <div class="card">
      <h2>订单状态分布</h2>
      <p v-for="(n, s) in data.statuses" :key="s">{{ s }}：{{ n }}</p>
    </div>
    <div class="card">
      <h2>套餐排行</h2>
      <p v-for="(n, s) in data.packages" :key="s">{{ s }}：{{ n }}</p>
    </div></template
  >
</template>
