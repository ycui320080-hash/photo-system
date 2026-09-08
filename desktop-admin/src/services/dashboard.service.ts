import { api } from './api';
export const loadDashboard = async () => ({
  stats: await api('/statistics'),
  orders: await api('/orders'),
});
