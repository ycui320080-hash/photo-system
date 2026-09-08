const { wrap, order, writeOrder, log } = require('./runtime');
exports.main = wrap(async ({ event, openid, staff, db, cloud }) => {
  return db.runTransaction(async (tx) => {
    const o = await order(tx, event.id, openid, staff);
    if (
      !['待确认', '待到店'].includes(o.status) ||
      o.paid > 0 ||
      Date.parse(o.appointment) - Date.now() < 7200000
    )
      throw Error('不符合取消条件');
    const slot = (await tx.collection('booking_slots').doc(o.slotId).get()).data;
    await tx
      .collection('booking_slots')
      .doc(o.slotId)
      .update({ data: { reserved: Math.max(0, slot.reserved - o.people) } });
    o.status = '已取消';
    o.history.push({ status: o.status, at: new Date().toISOString() });
    return writeOrder(tx, o, openid, 'booking-cancel');
  });
}, 'customer');
