import { api } from './api';
export const createBooking = (data: unknown) => api('/bookings', 'POST', data);
export const timeslots = (date: string) => api('/slots?date=' + date);
