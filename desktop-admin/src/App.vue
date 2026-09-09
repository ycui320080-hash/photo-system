<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from './stores/auth';
import { api } from './services/api';

const auth = useAuth();
const route = useRoute();
const router = useRouter();
const modeLabel = import.meta.env.VITE_MODE === 'cloudbase' ? 'CloudBase 云端' : '测试环境 · Mock';
const isLogin = computed(() => route.path === '/login');

const links = [
  { key: 'dashboard', label: '工作台', mark: '01' },
  { key: 'calendar', label: '预约日历', mark: '02' },
  { key: 'orders', label: '订单管理', mark: '03' },
  { key: 'packages', label: '套餐管理', mark: '04' },
  { key: 'photo-import', label: '照片管理', mark: '05' },
  { key: 'photo-selection', label: '选片管理', mark: '06' },
  { key: 'printing', label: '打印任务', mark: '07' },
  { key: 'delivery', label: '成片交付', mark: '08' },
  { key: 'customers', label: '顾客管理', mark: '09' },
  { key: 'statistics', label: '数据统计', mark: '10' },
  { key: 'settings', label: '系统设置', mark: '11' },
];

async function logout() {
  try {
    await api('/auth/logout', 'POST', {});
  } finally {
    sessionStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    auth.role = '';
    await router.replace('/login');
  }
}
</script>

<template>
  <router-view v-if="isLogin" />
  <div v-else-if="auth.role" class="shell">
    <aside class="sidebar">
      <div class="brand">
        <img class="brand-logo" src="./assets/images/logo-glyph.png" alt="商标" />
        <div>安工程校园照相馆<small>CAMPUS PHOTO STUDIO</small></div>
      </div>
      <div class="environment-label">{{ modeLabel }}</div>
      <nav>
        <router-link v-for="item in links" :key="item.key" :to="'/' + item.key">
          <span class="nav-mark">{{ item.mark }}</span><span>{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="aside-bottom">
        <div class="admin-avatar">A</div>
        <div><b>测试管理员</b><small>admin</small></div>
        <el-button text aria-label="退出登录" @click="logout">退出</el-button>
      </div>
    </aside>
    <main class="main-panel">
      <header class="topbar">
        <div><b>{{ links.find((item) => '/' + item.key === route.path)?.label || '工作台' }}</b><span>把校园时光，认真收藏。</span></div>
        <span class="data-badge"><i /> {{ modeLabel }} · 数据已持久化</span>
      </header>
      <router-view />
    </main>
  </div>
</template>