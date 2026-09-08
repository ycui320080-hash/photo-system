import { lockOrder } from './services/lock.service';
import { Router } from 'express';
import multer from 'multer';
import { writeFile } from 'node:fs/promises';
import { processPhoto } from './services/image-process.service';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { actor, staff } from './auth';
import { accessible } from './services/order.service';
import { get, list, save, log } from './db';
import type { Settings, Photo } from '../shared/types/models';
import { validateUpload } from '../shared/validators/upload.validator';
export const files = Router();
mkdirSync('.data/files', { recursive: true });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 20 },
  fileFilter: (_q, f, cb) => {
    try {
      validateUpload(f.mimetype, 1);
      cb(null, true);
    } catch {
      cb(Error('仅支持图片'));
    }
  },
});
files.post('/orders/:id/photos', upload.array('files', 20), async (q, r, next) => {
  const release = await lockOrder(String(q.params.id));
  try {
    const a = staff(q),
      o = accessible(String(q.params.id), a);
    const final = q.body.kind === 'delivery';
    const uploadKey = String(q.body.uploadKey || '');
    if (uploadKey && !/^[a-f0-9]{64}$/.test(uploadKey)) throw Error('上传任务ID无效');
    if (
      uploadKey &&
      list<Photo & { uploadKey?: string }>('photos').some(
        (p) => p.orderId === o.id && p.uploadKey === uploadKey,
      )
    ) {
      r.json({ ok: true, data: o });
      return;
    }
    if (final && !['修图中', '待顾客确认'].includes(o.status)) throw Error('请先完成选片');
    if (!final && !['待上传预览图', '待选片'].includes(o.status))
      throw Error('请先将订单推进至待上传预览图');
    const s = get<Settings>('store_settings', 'store');
    const incoming = q.files as Express.Multer.File[];
    if (!incoming?.length) throw Error('请选择照片');
    const result: Photo[] = [];
    for (const f of incoming) {
      validateUpload(f.mimetype, f.size, incoming.length);
      const id = randomUUID();
      const processed = await processPhoto(f.buffer, {
        final,
        quality: s.previewQuality,
        watermark: s.watermark,
      });
      await writeFile(resolve('.data/files', id + '.jpg'), processed.preview);
      await writeFile(resolve('.data/files', id + '.thumb.jpg'), processed.thumbnail);
      const photo = {
        uploadKey,
        id,
        orderId: o.id,
        number: 'PHOTO-' + String(o.photos.length + result.length + 1).padStart(4, '0'),
        url: '/files/' + id,
        expiresAt: new Date(Date.now() + s.retentionDays * 86400000).toISOString(),
      };
      save('photos', { ...photo, kind: final ? 'delivery' : 'preview' });
      result.push(photo);
    }
    if (final) {
      o.delivery = [...(o.delivery || []), ...result];
      o.status = '待顾客确认';
    } else {
      o.photos.push(...result);
      o.status = '待选片';
    }
    o.history.push({ status: o.status, at: new Date().toISOString() });
    save('orders', o);
    log(a.id, final ? 'delivery-create' : 'photo-preview-upload', o.id);
    r.json({ ok: true, data: o });
  } catch (e) {
    next(e);
  } finally {
    release();
  }
});
files.get('/files/:id', (q, r) => {
  if (!/^[0-9a-f-]{36}$/.test(String(q.params.id))) throw Error('文件编号无效');
  const p = get<Photo>('photos', String(q.params.id));
  accessible(p.orderId, actor(q));
  if (Date.parse(p.expiresAt) <= Date.now()) throw Error('文件已过期');
  r.sendFile(resolve('.data/files', p.id + (q.query.thumbnail === '1' ? '.thumb.jpg' : '.jpg')), {
    dotfiles: 'allow',
  });
});
