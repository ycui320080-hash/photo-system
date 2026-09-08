const { wrap, order, writeOrder, log } = require('./runtime');
exports.main = wrap(async ({ event, openid, staff, db, cloud }) => {
  return { userId: openid, role: staff?.role || 'customer' };
}, 'customer');
