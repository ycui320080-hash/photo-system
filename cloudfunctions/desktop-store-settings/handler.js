const { wrap } = require('./runtime');
exports.main = wrap(
  async ({ db }) => (await db.collection('store_settings').doc('store').get()).data,
);
