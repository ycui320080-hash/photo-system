import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { randomUUID, randomInt } from 'node:crypto';
import { resolve } from 'node:path';
import { actor } from './auth';
import { save, log } from './db';
import { printAmount } from '../shared/constants/printing';
import { validateUpload } from '../shared/validators/upload.validator';
import type { Order, Photo } from '../shared/types/models';
export const printing = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10485760, files: 20 },
});
printing.post('/print-orders', upload.array('files', 20), async (q, r, next) => {
  try {
    const a = actor(q),
      incoming = q.files as Express.Multer.File[];
    if (!incoming?.length) throw Error('请选择照片');
    const { size, paper, pickup } = q.body,
      quantity = Number(q.body.quantity),
      laminate = q.body.laminate === 'true';
    const amount = printAmount(size, quantity, paper, laminate, incoming.length);
    if (!Number.isFinite(Date.parse(pickup)) || Date.parse(pickup) < Date.now())
      throw Error('请选择未来取件时间');
    const now = new Date().toISOString(),
      id = 'PR' + Date.now() + randomInt(100, 999);
    const photos: Photo[] = [];
    for (const f of incoming) {
      validateUpload(f.mimetype, f.size, incoming.length);
      const pid = randomUUID();
      await sharp(f.buffer, { limitInputPixels: 40000000 })
        .rotate()
        .jpeg({ quality: 92 })
        .toFile(resolve('.data/files', pid + '.jpg'));
      const p = {
        id: pid,
        orderId: id,
        number: 'PRINT-' + (photos.length + 1),
        url: '/files/' + pid,
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      };
      save('photos', p);
      photos.push(p);
    }
    const o: Order = {
      id,
      userId: a.id,
      packageId: 'p14',
      packageName: '在线照片冲印',
      name: '演示冲印顾客',
      phone: '00000000000',
      people: 1,
      note: '',
      appointment: new Date(pickup).toISOString(),
      amount,
      paid: 0,
      status: '待打印',
      pickupCode: String(randomInt(0, 10000)).padStart(4, '0'),
      createdAt: now,
      updatedAt: now,
      history: [{ status: '待打印', at: now }],
      photos,
      selectionLocked: true,
      retouchCount: 0,
      print: { size, quantity, paper, laminate },
    };
    save('orders', o);
    log(a.id, 'print-order-create', id);
    r.json({ ok: true, data: o });
  } catch (e) {
    next(e);
  }
});
