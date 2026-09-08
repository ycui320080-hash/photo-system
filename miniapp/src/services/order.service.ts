import { api } from './api';
export const listOrders = () => api('/orders');
export const detail = (id: string) => api('/orders/' + id);
export const cancelOrder = (id: string) => api('/orders/' + id + '/cancel', 'POST', {});
