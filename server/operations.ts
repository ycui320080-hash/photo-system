import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { staff, actor } from './auth';
import { db, get, list, save, log } from './db';
import { accessible } from './services/order.service';
import { createBooking, slots } from './services/booking.service';
import type { Order, Photo } from '../shared/types/models';
import { unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
export const operations = Router();
operations.post('/offline-orders', (q, r) => {
  staff(q);
  r.json({ ok: true, data: createBooking(q.body, 'offline-' + randomUUID()) });
});
operations.post('/orders/:id/reschedule', (q, r) => {
  const a = staff(q),
    o = accessible(String(q.params.id), a);
  if (!['待确认', '待到店'].includes(o.status)) throw Error('当前状态不能改期');
  const { date, time } = q.body;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) throw Error('时间无效');
  const when = new Date(date + 'T' + time + ':00+08:00').toISOString();
  if (Date.parse(when) <= Date.now()) throw Error('请选择未来时间');
  if (
    when !== o.appointment &&
    (slots(date).find((s) => s.time === time)?.remaining || 0) < o.people
  )
    throw Error('预约名额不足');
  const previous = o.appointment;
  o.appointment = when;
  o.updatedAt = new Date().toISOString();
  save('orders', o);
  log(a.id, 'reschedule ' + previous + ' -> ' + when, o.id);
  r.json({ ok: true, data: o });
});
operations.post('/orders/:id/retouch', (q, r) => {
  const a = staff(q),
    o = accessible(String(q.params.id), a);
  const p = o.photos.find((p) => p.id === q.body.photoId);
  if (!p?.selected) throw Error('照片未被选中');
  save('retouch_requests', {
    id: p.id,
    orderId: o.id,
    status: q.body.done ? 'completed' : 'working',
    note: p.note,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  log(a.id, 'retouch-progress', p.id);
  r.json({ ok: true });
});
operations.post('/orders/:id/favorite', (q, r) => {
  const a = actor(q),
    o = accessible(String(q.params.id), a);
  const p = o.photos.find((p) => p.id === q.body.photoId);
  if (!p) throw Error('照片不存在');
  p.favorite = !!q.body.favorite;
  save('orders', o);
  r.json({ ok: true, data: o });
});
operations.post('/orders/:id/printing', (q, r) => {
  const a = staff(q),
    o = accessible(String(q.params.id), a);
  if (o.status !== '待打印') throw Error('不是待打印订单');
  save('print_tasks', {
    id: o.id,
    orderId: o.id,
    status: 'printing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  log(a.id, 'printing-start', o.id);
  r.json({ ok: true });
});
operations.get('/tasks', (q, r) => {
  staff(q);
  r.json({ ok: true, data: { retouch: list('retouch_requests'), printing: list('print_tasks') } });
});
operations.get('/backup', (q, r) => {
  staff(q, true);
  const collections = [
    'orders',
    'packages',
    'store_settings',
    'users',
    'payments',
    'photos',
    'retouch_requests',
    'print_tasks',
    'operation_logs',
  ];
  r.json({
    ok: true,
    data: {
      version: 1,
      createdAt: new Date().toISOString(),
      collections: Object.fromEntries(collections.map((c) => [c, list(c)])),
    },
  });
});
operations.post('/restore', (q, r) => {
  const a = staff(q, true);
  const snapshot = q.body.snapshot;
  if (snapshot?.version !== 1 || !snapshot.collections || q.body.confirm !== true)
    throw Error('请选择备份并确认恢复');
  const allowed = [
    'orders',
    'packages',
    'store_settings',
    'users',
    'payments',
    'photos',
    'retouch_requests',
    'print_tasks',
    'operation_logs',
  ];
  for (const [c, rows] of Object.entries(snapshot.collections)) {
    if (
      !allowed.includes(c) ||
      !Array.isArray(rows) ||
      rows.length > 100000 ||
      rows.some((x: any) => typeof x.id !== 'string')
    )
      throw Error('备份格式无效');
  }
  save('backups', {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    collections: Object.fromEntries(allowed.map((c) => [c, list(c)])),
  });
  db.exec('BEGIN IMMEDIATE');
  try {
    for (const [c, rows] of Object.entries(snapshot.collections))
      for (const row of rows as { id: string }[]) save(c, row);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  log(a.id, 'restore-merge', 'database');
  r.json({ ok: true, data: { restored: true } });
});
operations.get('/sync', (q, r) => {
  staff(q);
  r.json({
    ok: true,
    data: {
      mode: 'mock',
      database: 'SQLite',
      lastChecked: new Date().toISOString(),
      cloudConnected: false,
      localFiles: db.prepare('SELECT COUNT(*) AS count FROM local_files').get()?.count || 0,
    },
  });
});
operations.get('/expired-files', (q, r) => {
  staff(q, true);
  r.json({
    ok: true,
    data: list<Photo>('photos').filter(
      (p) =>
        Date.parse(p.expiresAt) < Date.now() &&
        ['已完成', '已取消'].includes(get<Order>('orders', p.orderId).status),
    ),
  });
});
operations.post('/expired-files/cleanup', (q, r) => {
  const a = staff(q, true);
  if (q.body.confirm !== true || !Array.isArray(q.body.ids)) throw Error('请确认具体文件');
  let deleted = 0;
  for (const id of q.body.ids) {
    if (!/^[0-9a-f-]{36}$/.test(id)) throw Error('文件ID无效');
    const p = get<Photo>('photos', id);
    if (
      Date.parse(p.expiresAt) > Date.now() ||
      !['已完成', '已取消'].includes(get<Order>('orders', p.orderId).status)
    )
      throw Error('文件未满足清理条件');
    try {
      for (const suffix of ['.jpg', '.thumb.jpg']) {
        try {
          unlinkSync(resolve('.data/files', id + suffix));
        } catch (e) {
          if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
        }
      }
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
    }
    save('photos', { ...p, deleted: true });
    log(a.id, 'expired-file-delete', id);
    deleted++;
  }
  r.json({ ok: true, data: { deleted } });
});

operations.post('/customers/:id', (q, r) => {
  const a = staff(q);
  const id = String(q.params.id);
  if (!list<Order>('orders').some((o) => o.userId === id)) throw Error('顾客不存在');
  const old = list<any>('users').find((u) => u.id === id) || { id };
  const customer = save('users', { ...old, staffNote: String(q.body.note || '').slice(0, 1000) });
  log(a.id, 'customer-note', id);
  r.json({ ok: true, data: customer });
});

operations.get('/customers/:id', (q, r) => {
  staff(q);
  const customer = list<any>('users').find((u) => u.id === String(q.params.id));
  r.json({ ok: true, data: { note: customer?.staffNote || '' } });
});
