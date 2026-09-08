const { wrap, order, writeOrder, log } = require('./runtime');
exports.main = wrap(async ({ event, openid, staff, db, cloud }) => {
  const page = Math.max(0, Math.min(10000, Number(event.page) || 0));
  const query = staff ? {} : { userId: openid };
  return (
    await db
      .collection('orders')
      .where(query)
      .orderBy('createdAt', 'desc')
      .skip(page * 50)
      .limit(50)
      .get()
  ).data.map((o) => ({
    ...o,
    phone: o.phone?.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2'),
    internalNote: staff ? o.internalNote : undefined,
  }));
}, 'customer');
