<script setup lang="ts">
defineProps<{ status: string }>();
const classes: Record<string, string> = {
  待确认: 'yellow',
  待到店: 'sage',
  已拍摄: 'sage',
  待选片: 'brick',
  修图中: 'brick',
  待顾客确认: 'yellow',
  待打印: 'yellow',
  待取件: 'sage',
  已完成: 'done',
  已取消: 'muted',
};
</script>

<template><text class="status-tag" :class="classes[status] || 'muted'">{{ status }}</text></template>

<style scoped>
.status-tag { display: inline-flex; padding: 5px 10px; align-items: center; border-radius: 999px; font-size: 11px; font-weight: 700; }
.brick { background: #f6e3df; color: #a5382d; }
.sage { background: #e5ece2; color: #52644e; }
.yellow { background: #f7edcf; color: #7e641b; }
.done { background: #e4ece8; color: #315e4f; }
.muted { background: #ece8e1; color: #716c64; }
</style>