const { wrap, order, writeOrder, log } = require('./runtime');
exports.main = wrap(async ({ event, openid, staff, db, cloud }) => {
  return db.runTransaction(async (tx) => {
    const o = await order(tx, event.id, openid, staff);
    if (!['修图中', '待选片'].includes(o.status)) throw Error('当前不能重新选片');
    o.selectionLocked = false;
    o.status = '待选片';
    o.history.push({ status: o.status, at: new Date().toISOString() });
    return writeOrder(tx, o, openid, 'photo-selection-reopen');
  });
}, 'staff');
