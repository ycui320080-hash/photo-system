import { api } from './api';
export const reschedule = (id: string, date: string, time: string) =>
  api('/orders/' + id + '/reschedule', 'POST', { date, time });
