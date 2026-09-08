const { wrap, order, writeOrder, log } = require('./runtime');
exports.main = wrap(async ({ event, openid, staff, db, cloud }) => {
  const o = await order(db, event.id, openid, staff);
  if (!staff) delete o.internalNote;
  if (staff?.role === 'staff') o.phone = o.phone?.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
  return o;
}, 'customer');
