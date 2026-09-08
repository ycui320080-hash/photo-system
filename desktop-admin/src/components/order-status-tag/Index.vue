<script setup lang="ts">
defineProps<{ status: string }>();
</script>
<template>
  <el-tag :type="status === '已完成' ? 'success' : status === '已取消' ? 'info' : 'warning'">{{
    status
  }}</el-tag>
</template>
