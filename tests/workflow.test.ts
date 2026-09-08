import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
// 独立测试数据库和端口，测试不污染演示订单。
mkdirSync('.data', { recursive: true });
const testDir = mkdtempSync(resolve('.data', 'test-'));
let output = '';
const child = spawn(
  process.execPath,
  [resolve('node_modules/tsx/dist/cli.mjs'), resolve('server/index.ts')],
  { cwd: testDir, env: { ...process.env, PORT: '8790' }, stdio: ['ignore', 'pipe', 'pipe'] },
);
child.stdout.on('data', (d) => (output += d));
child.stderr.on('data', (d) => (output += d));
let token = '';
async function request(path: string, method = 'GET', body?: unknown, t = token) {
  const r = await fetch('http://127.0.0.1:8790/api' + path, {
    method,
    headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return r.json();
}
test('预约、权限、照片选片、收款与统计完整流程', async () => {
  try {
    for (let i = 0; i < 100 && !output.includes('Mock API'); i++)
      await new Promise((r) => setTimeout(r, 100));
    assert.match(output, /Mock API/);
    const password = output.split('admin / ')[1]?.split('\n')[0].trim();
    assert.ok(password);
    const owner = (await request('/auth/login', 'POST', { account: 'admin', password })).data.token;
    token = (await request('/auth/customer', 'POST', {})).data.token;
    const date = new Date(Date.now() + 86400000 * 2).toLocaleDateString('sv-SE', {
      timeZone: 'Asia/Shanghai',
    });
    const input = {
      packageId: 'p0',
      date,
      time: '10:00',
      name: '测试同学',
      phone: '00000000000',
      people: 1,
      note: '自动验证',
      requestId: 'test-1',
      amount: 1,
      userId: 'forged',
      role: 'owner',
    };
    const created = await request('/bookings', 'POST', input);
    assert.equal(created.ok, true, JSON.stringify(created));
    const o = created.data;
    assert.equal(o.amount, 2900);
    assert.equal(o.userId, 'demo-customer');
    assert.match(o.pickupCode, /^\d{4}$/);
    assert.equal((await request('/bookings', 'POST', input)).data.id, o.id);
    assert.equal((await request('/orders')).data.length, 1);
    assert.equal((await request('/statistics')).ok, false);
    assert.equal((await request('/export')).ok, false);
    assert.equal(
      (await request('/orders/' + o.id, 'PATCH', { status: '已完成' }, owner)).ok,
      false,
    );
    for (const status of ['待到店', '已拍摄', '待上传预览图'])
      assert.equal((await request('/orders/' + o.id, 'PATCH', { status }, owner)).ok, true);
    const jpg = await sharp({
      create: { width: 1200, height: 800, channels: 3, background: '#d8c5a8' },
    })
      .jpeg()
      .toBuffer();
    const form = new FormData();
    form.append('uploadKey', 'a'.repeat(64));
    form.append('files', new Blob([new Uint8Array(jpg)], { type: 'image/jpeg' }), 'test.jpg');
    const uploaded = await (
      await fetch('http://127.0.0.1:8790/api/orders/' + o.id + '/photos', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + owner },
        body: form,
      })
    ).json();
    assert.equal(uploaded.ok, true, JSON.stringify(uploaded));
    const photo = uploaded.data.photos[0];
    const duplicate = await (
      await fetch('http://127.0.0.1:8790/api/orders/' + o.id + '/photos', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + owner },
        body: form,
      })
    ).json();
    assert.equal(duplicate.data.photos.length, 1);
    assert.equal(
      (await request('/orders/' + o.id + '/selection', 'POST', { photos: [{ id: 'wrong' }] })).ok,
      false,
    );
    assert.equal(
      (
        await request('/orders/' + o.id + '/selection', 'POST', {
          photos: [{ id: photo.id, note: '自然肤色' }],
        })
      ).ok,
      true,
    );
    assert.equal(
      (await request('/orders/' + o.id + '/selection', 'POST', { photos: [{ id: photo.id }] })).ok,
      false,
    );
    assert.equal((await request('/orders/' + o.id, 'PATCH', { paid: 1000 }, owner)).ok, true);
    const stats = (await request('/statistics', 'GET', undefined, owner)).data;
    assert.equal(stats.revenue, 1000);
    assert.equal(stats.unpaid, 1900);
    assert.equal(stats.total, 1);
    const detail = (await request('/orders/' + o.id)).data;
    assert.ok(detail.history.length >= 5);
    const deliveryForm = new FormData();
    deliveryForm.append(
      'files',
      new Blob([new Uint8Array(jpg)], { type: 'image/jpeg' }),
      'final.jpg',
    );
    deliveryForm.append('kind', 'delivery');
    const delivered = await (
      await fetch('http://127.0.0.1:8790/api/orders/' + o.id + '/photos', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + owner },
        body: deliveryForm,
      })
    ).json();
    assert.equal(delivered.ok, true, JSON.stringify(delivered));
    const finalPhoto = delivered.data.delivery[0];
    assert.equal(
      (await request('/orders/' + o.id + '/confirm', 'POST', { revision: '请保持自然肤色' })).ok,
      true,
    );
    assert.equal(
      (await request('/orders/' + o.id + '/confirm', 'POST', { revision: '重复意见' })).ok,
      false,
    );
    assert.equal((await request('/orders/' + o.id + '/confirm', 'POST', {})).ok, true);
    const downloaded = await fetch('http://127.0.0.1:8790/api/files/' + finalPhoto.id, {
      headers: { Authorization: 'Bearer ' + token },
    });
    assert.equal(downloaded.status, 200, await downloaded.clone().text());
    assert.equal(downloaded.headers.get('content-type'), 'image/jpeg');
    const { DatabaseSync } = await import('node:sqlite');
    const isolated = new DatabaseSync(resolve(testDir, '.data/studio.sqlite'));
    const raw = isolated
      .prepare('SELECT data FROM records WHERE collection=? AND id=?')
      .get('photos', finalPhoto.id);
    const expired = { ...JSON.parse(String(raw!.data)), expiresAt: '2000-01-01T00:00:00.000Z' };
    isolated
      .prepare('UPDATE records SET data=? WHERE collection=? AND id=?')
      .run(JSON.stringify(expired), 'photos', finalPhoto.id);
    isolated.close();
    assert.equal(
      (
        await fetch('http://127.0.0.1:8790/api/files/' + finalPhoto.id, {
          headers: { Authorization: 'Bearer ' + token },
        })
      ).status,
      400,
    );
    const printForm = new FormData();
    printForm.append('files', new Blob([new Uint8Array(jpg)], { type: 'image/jpeg' }), 'print.jpg');
    for (const [k, v] of Object.entries({
      size: '6寸',
      quantity: '2',
      paper: '绒面',
      laminate: 'true',
      pickup: date + 'T18:00:00+08:00',
    }))
      printForm.append(k, v);
    const printed = await (
      await fetch('http://127.0.0.1:8790/api/print-orders', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: printForm,
      })
    ).json();
    assert.equal(printed.ok, true);
    assert.equal(printed.data.amount, 700);
    assert.equal((await request('/backup', 'GET', undefined, owner)).ok, true);
    assert.equal((await request('/backup')).ok, false);
    const cancelOrder = (
      await request('/bookings', 'POST', { ...input, requestId: 'test-2', time: '11:00' })
    ).data;
    assert.equal((await request('/orders/' + cancelOrder.id + '/cancel', 'POST', {})).ok, true);
    assert.equal(
      (await request('/bookings', 'POST', { ...input, requestId: 'test-full', people: 20 })).ok,
      false,
    );
    const unauth = await request('/orders', 'GET', undefined, '');
    assert.equal(unauth.ok, false);
  } finally {
    child.kill();
  }
});
