<script setup lang="ts">
import { useData } from '../../composables/useData';
import { api } from '../../services/api';
import { money, chinaTime } from '../../../../shared/utils/format';

const { data, busy, error, reload } = useData(
  async () => ({ stats: await api('/statistics'), orders: await api('/orders') }),
  { stats: {}, orders: [] },
);
</script>

<template>
  <section class="dashboard-heading">
    <div>
      <span class="dashboard-eyebrow">TODAY AT THE STUDIO</span>
      <h1>今天，也拍一张好照片。</h1>
      <p class="sub">预约、修图、打印与交付，一眼掌握。</p>
    </div>
    <el-button type="primary" @click="reload">刷新工作台</el-button>
  </section>

  <el-alert v-if="error" :title="error" type="error" />
  <div v-loading="busy">
    <section class="campus-banner">
      <div class="banner-image" />
      <div class="banner-shade" />
      <div class="banner-copy">
        <span>GRADUATION SEASON</span>
        <h2>毕业季服务进行中</h2>
        <p>合理安排摄影师与修图进度，让每一份青春记忆准时交付。</p>
      </div>
      <div class="banner-note">中性占位图 · 待替换授权校园实拍</div>
    </section>

    <div class="metrics">
      <div class="card metric" v-for="(value, label) in {
        今日预约: data.stats.today || 0,
        待确认: data.stats.statuses?.['待确认'] || 0,
        修图中: data.stats.statuses?.['修图中'] || 0,
        待取件: data.stats.statuses?.['待取件'] || 0,
      }" :key="label">
        <span>{{ label }}</span><b>{{ value }}</b><small>Mock 经营数据</small>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card recent-orders">
        <div class="card-heading"><div><h2>最近订单</h2><p>优先处理临近预约和交付任务</p></div><router-link to="/orders">查看全部</router-link></div>
        <el-table :data="data.orders.slice().reverse().slice(0, 7)" empty-text="还没有订单，去顾客端创建第一笔预约吧">
          <el-table-column prop="id" label="订单编号" min-width="155" />
          <el-table-column prop="packageName" label="服务" min-width="130" />
          <el-table-column prop="status" label="进度" width="100" />
          <el-table-column label="预约时间" min-width="150"><template #default="scope">{{ chinaTime(scope.row.appointment) }}</template></el-table-column>
        </el-table>
      </div>
      <div class="side-metrics">
        <div class="card money-card"><span>累计实收</span><b>¥ {{ money(data.stats.revenue || 0) }}</b><small>已完成收款</small></div>
        <div class="card money-card warning"><span>待收款</span><b>¥ {{ money(data.stats.unpaid || 0) }}</b><small>请在顾客到店时核对</small></div>
        <div class="card money-card green"><span>本月订单</span><b>{{ data.stats.month || 0 }}</b><small>Mock 数据实时汇总</small></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-heading { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 18px; }
.dashboard-eyebrow { color: var(--brick); font-size: 9px; font-weight: 800; letter-spacing: 2.4px; }
.dashboard-heading .sub { margin-bottom: 0; }
.campus-banner { position: relative; height: 174px; margin-bottom: 16px; overflow: hidden; border-radius: 16px; color: #fff; }
.banner-image { position: absolute; inset: 0; background: url('../../assets/images/banner/campus-neutral.svg') center 55%/cover no-repeat; }
.banner-shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(37,35,31,.87), rgba(37,35,31,.22)); }
.banner-copy { position: absolute; z-index: 2; top: 50%; left: 30px; transform: translateY(-50%); }
.banner-copy span { color: var(--yellow); font-size: 9px; font-weight: 700; letter-spacing: 2px; }
.banner-copy h2 { margin: 9px 0 7px; font-family: 'STSong','Songti SC',serif; font-size: 25px; }
.banner-copy p { margin: 0; color: #e7e0d6; font-size: 11px; }
.banner-note { position: absolute; right: 12px; bottom: 10px; padding: 4px 7px; background: rgba(37,35,31,.68); border-radius: 4px; color: #ddd6cb; font-size: 8px; }
.metric span { color: var(--muted); font-size: 11px; }
.metric small,.money-card small { display: block; margin-top: 4px; color: #979086; font-size: 9px; }
.dashboard-grid { display: grid; margin-top: 16px; grid-template-columns: minmax(0,1fr) 240px; gap: 14px; }
.card-heading { display: flex; margin-bottom: 13px; align-items: flex-start; justify-content: space-between; }
.card-heading h2 { margin: 0 0 4px; }
.card-heading p { margin: 0; color: var(--muted); font-size: 10px; }
.card-heading a { color: var(--brick); font-size: 11px; text-decoration: none; }
.side-metrics { display: grid; gap: 12px; }
.money-card { margin: 0; border-left: 4px solid var(--brick); }
.money-card.warning { border-left-color: var(--yellow); }
.money-card.green { border-left-color: var(--sage); }
.money-card span { color: var(--muted); font-size: 10px; }
.money-card b { display: block; margin-top: 10px; font-family: Georgia,serif; font-size: 22px; }
@media (max-width: 1280px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .side-metrics { grid-template-columns: repeat(3,1fr); }
}
</style>