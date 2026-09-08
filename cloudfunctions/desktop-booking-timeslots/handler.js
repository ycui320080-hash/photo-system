const { wrap, order, writeOrder, log } = require('./runtime');
exports.main = wrap(async ({ event, openid, staff, db, cloud }) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date)) throw Error('日期无效');
  return (
    await db
      .collection('booking_slots')
      .where({ date: event.date, status: 'open' })
      .orderBy('time', 'asc')
      .limit(48)
      .get()
  ).data.map((s) => ({ id: s._id, time: s.time, remaining: Math.max(0, s.capacity - s.reserved) }));
}, 'customer');
