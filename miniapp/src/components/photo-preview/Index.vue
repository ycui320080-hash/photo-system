<script setup lang="ts">
defineProps<{ url: string }>();
</script>
<template>
  <image :src="url" mode="widthFix" style="width: 100%" :show-menu-by-longpress="false" />
</template>
