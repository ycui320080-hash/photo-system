const { wrap, order, writeOrder, log } = require('./runtime');
exports.main = wrap(async ({ event, openid, staff, db, cloud }) => {
  return (
    await db.collection('packages').where(staff?{}:{ enabled: true }).orderBy('sort', 'asc').limit(100).get()
  ).data;
}, 'customer');
