<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../../services/api';
import { useAuth } from '../../stores/auth';

const cloudMode = import.meta.env.VITE_MODE === 'cloudbase';
const mockMode = !cloudMode;
const testAccount = import.meta.env.VITE_TEST_ADMIN_USERNAME || 'admin';
const testPassword = import.meta.env.VITE_TEST_ADMIN_PASSWORD || '123456';
const account = ref(testAccount);
const password = ref(mockMode ? testPassword : '');
const remember = ref(true);
const error = ref('');
const busy = ref(false);
const auth = useAuth();
const router = useRouter();
const route = useRoute();

async function submit() {
  busy.value = true;
  error.value = '';
  try {
    const session = await api('/auth/login', 'POST', {
      account: account.value.trim(),
      password: password.value,
    });
    sessionStorage.setItem('token', session.token);
    sessionStorage.setItem('role', session.role);
    if (remember.value) {
      localStorage.setItem('token', session.token);
      localStorage.setItem('role', session.role);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }
    auth.role = session.role;
    await router.replace(String(route.query.redirect || '/dashboard'));
  } catch (e) {
    error.value = (e as Error).message || '登录失败，请检查账号和密码';
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <section class="login-visual">
      <div class="visual-image" />
      <div class="visual-shade" />
      <div class="visual-copy">
        <span class="login-eyebrow">CAMPUS PHOTO STUDIO</span>
        <h1>把每一次快门，<br />变成校园记忆。</h1>
        <p>预约、选片、修图、打印与交付，在一个工作台里完成。</p>
        <span class="placeholder-note">中性占位图 · 待替换授权校园实拍</span>
      </div>
    </section>
    <section class="login-panel">
      <div class="login-box">
        <div class="test-badge">测试环境</div>
        <div class="login-brand"><img class="brand-logo" src="../../assets/images/logo-glyph.png" alt="商标" /><div>安工程校园照相馆<small>电脑管理端</small></div></div>
        <h2>欢迎回来</h2>
        <p class="sub">登录后进入今日工作台</p>
        <el-alert v-if="mockMode" type="warning" :closable="false" show-icon>
          <template #title>测试账号：{{ testAccount }}　密码：{{ testPassword }}</template>
        </el-alert>
        <el-form label-position="top" @submit.prevent="submit">
          <el-form-item label="管理员账号">
            <el-input v-model="account" autocomplete="username" placeholder="请输入管理员账号" />
          </el-form-item>
          <el-form-item label="登录密码">
            <el-input v-model="password" type="password" autocomplete="current-password" show-password placeholder="请输入密码" @keyup.enter="submit" />
          </el-form-item>
          <div class="login-options"><el-checkbox v-model="remember">记住登录状态</el-checkbox><span>Mock 环境专用</span></div>
          <p v-if="error" class="error" role="alert">{{ error }}</p>
          <el-button class="login-button" type="primary" native-type="submit" :loading="busy">进入工作台</el-button>
        </el-form>
        <p class="security-note">生产环境不会启用测试账号。请勿在此输入真实商业密码。</p>
      </div>
    </section>
  </div>
</template>