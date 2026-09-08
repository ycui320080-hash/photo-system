<script setup lang="ts">
defineProps<{ photos: any[]; urls: Record<string, string>; selected: string[] }>();
defineEmits(['toggle']);
</script>
<template>
  <view class="grid"
    ><view class="card" v-for="p in photos" :key="p.id"
      ><image :src="urls[p.id]" mode="widthFix" style="width: 100%" /><view>{{ p.number }}</view
      ><button @click="$emit('toggle', p.id)">
        {{ selected.includes(p.id) ? '✓ 已选' : '选择精修' }}
      </button></view
    ></view
  >
</template>
