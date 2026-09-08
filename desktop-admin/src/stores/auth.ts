import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuth = defineStore('auth', () => {
  const role = ref(sessionStorage.getItem('role') || localStorage.getItem('role') || '');
  return { role };
});