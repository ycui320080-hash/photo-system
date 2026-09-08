import { randomUUID, randomInt } from 'node:crypto';
import { get, list, save, log } from '../db';
import { validateBooking } from '../../shared/validators/booking.validator';
import type { BookingInput, Order, Package, Settings } from '../../shared/types/models';
export function slots(date: string) {
  const s = get<Settings>('store_settings', 'store');
  if (s.closedDates.split(',').includes(date)) return [];
  const [start, end] = s.hours.split('-').map((x) => Number(x.split(':')[0]));
  return Array.from({ length: Math.max(0, end - start) }, (_, i) => {
    const time = String(start + i).padStart(2, '0') + ':00';
    return {
      time,
      remaining: Math.max(
        0,
        s.capacity -
          list<Order>('orders')
            .filter(
              (o) =>
                o.appointment === new Date(date + 'T' + time + ':00+08:00').toISOString() &&
                o.status !== '已取消',
            )
            .reduce((n, o) => n + o.people, 0),
      ),
    };
  });
}
export function createBooking(input: BookingInput, userId: string) {
  validateBooking(input);
  const existing = list<Order & { requestId: string }>('orders').find(
    (o) => o.userId === userId && o.requestId === input.requestId,
  );
  if (existing) return existing;
  const p = get<Package>('packages', input.packageId);
  if (!p.enabled) throw Error('套餐已下架');
  const slot = slots(input.date).find((s) => s.time === input.time);
  if (!slot || slot.remaining < input.people) throw Error('该时段名额不足');
  const now = new Date().toISOString();
  const o: Order & { requestId: string } = {
    id: 'CP' + Date.now() + randomInt(100, 999),
    userId,
    packageId: p.id,
    packageName: p.name,
    name: input.name.trim(),
    phone: input.phone,
    people: input.people,
    note: input.note.slice(0, 500),
    appointment: new Date(input.date + 'T' + input.time + ':00+08:00').toISOString(),
    amount: p.price * input.people,
    paid: 0,
    status: '待确认',
    pickupCode: String(randomInt(0, 10000)).padStart(4, '0'),
    createdAt: now,
    updatedAt: now,
    history: [{ status: '待确认', at: now }],
    photos: [],
    selectionLocked: false,
    retouchCount: p.retouchCount,
    requestId: input.requestId,
  };
  save('orders', o);
  log(userId, 'booking-create', o.id);
  return o;
}
export function cancel(o: Order) {
  if (
    !['待确认', '待到店'].includes(o.status) ||
    Date.parse(o.appointment) - Date.now() < 2 * 3600000 ||
    o.paid > 0
  )
    throw Error('须提前2小时且未付款，已付款请联系门店');
  o.status = '已取消';
  o.updatedAt = new Date().toISOString();
  o.history.push({ status: o.status, at: o.updatedAt });
  save('orders', o);
  log(o.userId, 'booking-cancel', o.id);
  return o;
}
export const id = () => randomUUID();
