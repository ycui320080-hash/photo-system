import { api } from './api';
export const login = (account: string, password: string) =>
  api('/auth/login', 'POST', { account, password });
export const logout = () => api('/auth/logout', 'POST', {});
