const { wrap, order, writeOrder, log } = require('./runtime');
exports.main = wrap(async ({ event, openid, staff, db, cloud }) => {
  return db.runTransaction(async (tx) => {
    const o = await order(tx, event.id, openid, null);
    if (o.status !== '待顾客确认' || !o.delivery?.length) throw Error('当前没有可确认成片');
    if (event.revision) {
      if (o.revision) throw Error('仅允许一次修改意见');
      o.revision = String(event.revision).slice(0, 500);
    } else {
      o.confirmed = true;
      o.status = '待打印';
      o.history.push({ status: o.status, at: new Date().toISOString() });
    }
    return writeOrder(tx, o, openid, 'delivery-confirm');
  });
}, 'customer');
