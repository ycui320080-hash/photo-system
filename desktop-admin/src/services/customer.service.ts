import { api } from './api';
import { maskPhone } from '../../../shared/utils/format';
export const listCustomers = async () => {
  const orders = await api('/orders');
  const map = new Map<string, any>();
  for (const o of orders) {
    const c = map.get(o.userId) || {
      id: o.userId,
      name: o.name,
      phone: maskPhone(o.phone),
      count: 0,
      paid: 0,
      lastVisit: o.appointment,
      orders: [],
    };
    c.count++;
    c.paid += o.paid;
    c.orders.push(o);
    if (o.appointment > c.lastVisit) c.lastVisit = o.appointment;
    map.set(o.userId, c);
  }
  return [...map.values()];
};
export const saveCustomerNote = (id: string, note: string) =>
  api('/customers/' + id, 'POST', { note });
export const exportCustomers = async () => {
  await api('/export');
  return listCustomers();
};
