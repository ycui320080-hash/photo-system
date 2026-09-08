import { unwrap } from '../../../shared/api/client';
declare const wx: any;
let initialized = false;
export async function cloudRequest<T>(path: string, method: string, body: any = {}): Promise<T> {
  if (!initialized) {
    const env = import.meta.env.VITE_CLOUDBASE_ENV;
    if (!env) throw Error('请配置云环境ID');
    wx.cloud.init({ env, traceUser: false });
    initialized = true;
  }
  let name = '',
    data = body;
  const match = path.match(/^\/orders\/([^/]+)(?:\/(.+))?$/);
  if (path === '/packages') name = 'package-list';
  else if (path === '/orders') name = 'order-list';
  else if (path === '/bookings') {
    name = 'booking-create';
    const response = await wx.cloud.callFunction({
      name: 'booking-timeslots',
      data: { date: body.date },
    });
    const slots = unwrap<any[]>(response.result);
    const slot = slots.find((s) => s.time === body.time);
    if (!slot) throw Error('预约时段已关闭');
    data = { ...body, slotId: slot.id };
  } else if (path.startsWith('/slots?')) {
    name = 'booking-timeslots';
    data = { date: path.split('date=')[1] };
  } else if (path === '/profile') name = 'customer-profile';
  else if (path === '/settings') name = 'store-settings';
  else if (match) {
    data = { ...body, id: match[1] };
    name =
      (
        {
          cancel: 'booking-cancel',
          selection: 'photo-selection-submit',
          reopen: 'photo-selection-reopen',
          confirm: 'delivery-confirm',
          favorite: 'photo-favorite',
        } as Record<string, string>
      )[match[2]] || (method === 'GET' ? 'order-detail' : 'order-update-status');
  }
  if (!name) throw Error('此接口尚未启用云端适配');
  const r = await wx.cloud.callFunction({ name, data });
  return unwrap<T>(r.result);
}

export async function cloudCall<T = any>(name: string, data: any = {}): Promise<T> {
  if (!initialized) {
    const env = import.meta.env.VITE_CLOUDBASE_ENV;
    if (!env) throw Error('请配置云环境ID');
    wx.cloud.init({ env, traceUser: false });
    initialized = true;
  }
  return unwrap<T>((await wx.cloud.callFunction({ name, data })).result);
}
