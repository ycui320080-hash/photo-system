import { api } from './api';
export const confirmDelivery = (id: string, revision = '') =>
  api('/orders/' + id + '/confirm', 'POST', { revision });
