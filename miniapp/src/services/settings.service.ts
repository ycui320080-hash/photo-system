import { api } from './api';
export const loadSettings = () => api('/settings');
export const saveSettings = (data: unknown) => api('/settings', 'PUT', data);
