const platform='wechat';const cloudbase=require('@cloudbase/node-sdk');const backend=cloudbase.init({env:cloudbase.SYMBOL_CURRENT_ENV});
const cloud = require('wx-server-sdk');
const crypto = require('node:crypto');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
exports.wrap =
  (handler, role = 'customer') =>
  async (event, invocationContext) => {
    try {
      let openid,query;if(platform==='desktop'){const auth=await backend.auth().getAuthContext(invocationContext);if(!auth.uid||auth.loginType==='ANONYMOUS')throw Error('未认证桌面调用');openid='cb:'+auth.uid;query={cloudUid:auth.uid,status:'active'}}else{const context=cloud.getWXContext();if(!context.OPENID)throw Error('未认证微信调用');openid=context.OPENID;query={openid,status:'active'}}const result=await db.collection('staff').where(query).limit(1).get();const staff=result.data[0];if(platform==='desktop'&&!staff)throw Error('账号未被授予店员权限');
if (role === 'staff' && !staff) throw Error('需要店员权限');
      if (role === 'owner' && staff?.role !== 'owner') throw Error('需要店主权限');
      return { ok: true, data: await handler({ event: event || {}, openid, staff, db, cloud }) };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  };
exports.order = async (db, id, openid, staff) => {
  if (typeof id !== 'string' || id.length > 100) throw Error('订单编号无效');
  const { data } = await db.collection('orders').doc(id).get();
  if (!data || (!staff && data.userId !== openid)) throw Error('无订单访问权限');
  return data;
};
exports.log = async (db, actor, action, target) =>
  db
    .collection('operation_logs')
    .add({
      data: {
        actor,
        action,
        target,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'recorded',
      },
    });
exports.id = () => crypto.randomUUID();
exports.writeOrder = async (db, o, actor, action) => {
  o.updatedAt = new Date().toISOString();
  const { _id, ...data } = o;
  await db
    .collection('orders')
    .doc(o.id || _id)
    .set({ data });
  await exports.log(db, actor, action, o.id || _id);
  return data;
};
