import { api } from './api';
export const loadProfile = () => api('/profile');
export const saveProfile = (data: unknown) => api('/profile', 'POST', data);
