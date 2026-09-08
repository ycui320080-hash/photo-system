const { wrap, order, writeOrder, log } = require('./runtime');
exports.main = wrap(async ({ event, openid, staff, db, cloud }) => {
  const { packageId, slotId, name, phone, people, requestId } = event;
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    name.length > 40 ||
    !/^1[3-9]\d{9}$/.test(phone) ||
    !Number.isInteger(people) ||
    people < 1 ||
    people > 20 ||
    typeof requestId !== 'string' ||
    requestId.length > 100
  )
    throw Error('预约参数无效');
  const key = require('node:crypto')
    .createHash('sha256')
    .update(openid + requestId)
    .digest('hex');
  return db.runTransaction(async (tx) => {
    let prior;
    try {
      prior = (await tx.collection('orders').doc(key).get()).data;
    } catch {}
    if (prior) return prior;
    const p = (await tx.collection('packages').doc(packageId).get()).data;
    const slot = (await tx.collection('booking_slots').doc(slotId).get()).data;
    if (
      !p.enabled ||
      slot.status !== 'open' ||
      slot.reserved + people > slot.capacity ||
      Date.parse(slot.startAt) < Date.now()
    )
      throw Error('套餐或时段不可预约');
    const now = new Date().toISOString();
    const o = {
      id: key,
      userId: openid,
      packageId,
      slotId,
      packageName: p.name,
      name: name.trim(),
      phone,
      people,
      note: String(event.note || '').slice(0, 500),
      appointment: slot.startAt,
      amount: p.price * people,
      paid: 0,
      status: '待确认',
      pickupCode: String(require('node:crypto').randomInt(10000)).padStart(4, '0'),
      photos: [],
      retouchCount: p.retouchCount,
      selectionLocked: false,
      history: [{ status: '待确认', at: now }],
      createdAt: now,
      updatedAt: now,
    };
    await tx
      .collection('booking_slots')
      .doc(slotId)
      .update({ data: { reserved: slot.reserved + people, updatedAt: now } });
    return writeOrder(tx, o, openid, 'booking-create');
  });
}, 'customer');
