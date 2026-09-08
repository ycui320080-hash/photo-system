import { Router } from 'express';
import { actor, staff, login, issue, logout } from './auth';
import { get, list, save, log } from './db';
import { createBooking, cancel, slots } from './services/booking.service';
import { accessible, update } from './services/order.service';
import { summary } from './services/statistics.service';
import { maskPhone } from '../shared/utils/format';
import type { Order, Package, Settings } from '../shared/types/models';
export const router = Router();
router.post('/auth/login', (q, r) =>
  r.json({ ok: true, data: login(q.body.account, q.body.password) }),
);
router.post('/auth/customer', (_q, r) =>
  r.json({ ok: true, data: issue('demo-customer', 'customer') }),
);
router.post('/auth/logout', (q, r) => {
  logout(q);
  r.json({ ok: true });
});
router.get('/packages', (_q, r) => r.json({ ok: true, data: list('packages') }));
router.get('/settings', (_q, r) => r.json({ ok: true, data: get('store_settings', 'store') }));
router.put('/settings', (q, r) => {
  staff(q, true);
  const s = q.body as Settings;
  if (
    !s.name ||
    !/^\d{2}:00-\d{2}:00$/.test(s.hours) ||
    !Number.isInteger(s.capacity) ||
    s.capacity < 1 ||
    s.capacity > 100 ||
    s.retentionDays < 1 ||
    s.retentionDays > 90
  )
    throw Error('请检查营业时间、容量和保存天数');
  r.json({ ok: true, data: save('store_settings', { ...s, id: 'store' }) });
});
router.put('/packages/:id', (q, r) => {
  staff(q, true);
  const p = q.body as Package;
  if (
    !p.name ||
    !Number.isInteger(p.price) ||
    p.price < 0 ||
    !Number.isInteger(p.retouchCount) ||
    p.retouchCount < 0
  )
    throw Error('套餐字段无效');
  r.json({ ok: true, data: save('packages', { ...p, id: String(q.params.id) }) });
});
router.get('/slots', (q, r) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(q.query.date))) throw Error('日期无效');
  r.json({ ok: true, data: slots(String(q.query.date)) });
});
router.post('/bookings', (q, r) => r.json({ ok: true, data: createBooking(q.body, actor(q).id) }));
router.get('/orders', (q, r) => {
  const a = actor(q);
  r.json({
    ok: true,
    data: list<Order>('orders')
      .filter((o) => a.role !== 'customer' || o.userId === a.id)
      .map((o) =>
        a.role === 'staff'
          ? { ...o, phone: maskPhone(o.phone) }
          : a.role === 'customer'
            ? { ...o, internalNote: undefined }
            : o,
      ),
  });
});
router.get('/orders/:id', (q, r) => {
  const a = actor(q);
  const o = accessible(String(q.params.id), a);
  r.json({
    ok: true,
    data:
      a.role === 'staff'
        ? { ...o, phone: maskPhone(o.phone) }
        : a.role === 'customer'
          ? { ...o, internalNote: undefined }
          : o,
  });
});
router.post('/orders/:id/cancel', (q, r) =>
  r.json({ ok: true, data: cancel(accessible(String(q.params.id), actor(q))) }),
);
router.patch('/orders/:id', (q, r) => {
  const a = staff(q);
  r.json({ ok: true, data: update(accessible(String(q.params.id), a), q.body, a.id) });
});
router.post('/orders/:id/selection', (q, r) => {
  const a = actor(q),
    o = accessible(String(q.params.id), a);
  if (o.selectionLocked || o.status !== '待选片') throw Error('当前不可选片');
  const selected = q.body.photos;
  if (
    !Array.isArray(selected) ||
    !selected.length ||
    selected.length > o.retouchCount ||
    new Set(selected.map((p: { id: string }) => p.id)).size !== selected.length
  )
    throw Error('请选择套餐数量内的不重复照片');
  if (selected.some((p: { id: string }) => !o.photos.some((x) => x.id === p.id)))
    throw Error('照片不属于订单');
  o.photos = o.photos.map((p) => {
    const s = selected.find((x: { id: string }) => x.id === p.id);
    return { ...p, selected: !!s, note: String(s?.note || '').slice(0, 500) };
  });
  o.selectionLocked = true;
  o.status = '修图中';
  o.history.push({ status: o.status, at: new Date().toISOString() });
  save('orders', o);
  log(a.id, 'selection-submit', o.id);
  r.json({ ok: true, data: o });
});
router.post('/orders/:id/reopen', (q, r) => {
  const a = staff(q),
    o = accessible(String(q.params.id), a);
  if (!['修图中', '待选片'].includes(o.status)) throw Error('当前不可重新选片');
  o.selectionLocked = false;
  o.status = '待选片';
  o.history.push({ status: o.status, at: new Date().toISOString() });
  save('orders', o);
  log(a.id, 'selection-reopen', o.id);
  r.json({ ok: true, data: o });
});
router.post('/orders/:id/confirm', (q, r) => {
  const a = actor(q),
    o = accessible(String(q.params.id), a);
  if (o.status !== '待顾客确认' || !o.delivery?.length) throw Error('暂无待确认成片');
  if (q.body.revision) {
    if (o.revision) throw Error('仅允许一次修改意见');
    o.revision = String(q.body.revision).slice(0, 500);
  } else {
    o.confirmed = true;
    o.status = '待打印';
    o.history.push({ status: o.status, at: new Date().toISOString() });
  }
  save('orders', o);
  log(a.id, 'delivery-confirm', o.id);
  r.json({ ok: true, data: o });
});
router.get('/statistics', (q, r) => {
  staff(q);
  r.json({ ok: true, data: summary() });
});
router.get('/export', (q, r) => {
  staff(q, true);
  r.json({
    ok: true,
    data: list<Order>('orders').map((o) => ({ ...o, phone: maskPhone(o.phone) })),
  });
});
router.post('/profile', (q, r) => {
  const a = actor(q);
  const existing = list<any>('users').find((u) => u.id === a.id) || {
    id: a.id,
    contacts: [],
    createdAt: new Date().toISOString(),
  };
  if (q.body.contacts !== undefined) {
    if (
      !Array.isArray(q.body.contacts) ||
      q.body.contacts.length > 10 ||
      q.body.contacts.some(
        (c: any) =>
          typeof c.name !== 'string' ||
          !c.name.trim() ||
          c.name.length > 40 ||
          typeof c.phone !== 'string' ||
          !/^\d{11}$/.test(c.phone),
      )
    )
      throw Error('联系人格式无效');
    existing.contacts = q.body.contacts.map((c: any) => ({ name: c.name, phone: c.phone }));
  }
  if (q.body.deletionRequested) existing.deletionRequested = true;
  existing.updatedAt = new Date().toISOString();
  r.json({ ok: true, data: save('users', existing) });
});
router.get('/profile', (q, r) => {
  const a = actor(q);
  r.json({
    ok: true,
    data: list<{ id: string }>('users').find((u) => u.id === a.id) || { id: a.id, contacts: [] },
  });
});
