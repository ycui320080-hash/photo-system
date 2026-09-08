const { wrap, order, writeOrder, log } = require('./runtime');
exports.main = wrap(async ({ event, openid, staff, db, cloud }) => {
  return db.runTransaction(async (tx) => {
    const o = await order(tx, event.id, openid, null);
    if (
      o.selectionLocked ||
      o.status !== '待选片' ||
      !Array.isArray(event.photos) ||
      event.photos.length < 1 ||
      event.photos.length > o.retouchCount ||
      new Set(event.photos.map((p) => p.id)).size !== event.photos.length
    )
      throw Error('选片参数或状态无效');
    if (event.photos.some((p) => !o.photos.some((x) => x.id === p.id)))
      throw Error('照片不属于订单');
    o.photos = o.photos.map((p) => {
      const s = event.photos.find((x) => x.id === p.id);
      return { ...p, selected: !!s, note: String(s?.note || '').slice(0, 500) };
    });
    o.selectionLocked = true;
    o.status = '修图中';
    o.history.push({ status: o.status, at: new Date().toISOString() });
    return writeOrder(tx, o, openid, 'photo-selection-submit');
  });
}, 'customer');
