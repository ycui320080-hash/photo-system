import { api } from './api';
export const listTasks = () => api('/tasks');
export const startPrinting = (id: string) => api('/orders/' + id + '/printing', 'POST', {});
export const finishPrinting = (id: string) => api('/orders/' + id, 'PATCH', { status: '待取件' });
