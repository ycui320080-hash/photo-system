import cloudbase from '@cloudbase/js-sdk';
import { unwrap } from '../../../shared/api/client';
let app: ReturnType<typeof cloudbase.init> | undefined;
function client() {
  const env = import.meta.env.VITE_CLOUDBASE_ENV;
  if (!env) throw Error('请配置云环境ID');
  return app || (app = cloudbase.init({ env }));
}
export async function callCloud<T = any>(name: string, data: unknown = {}): Promise<T> {
  const result = await client().callFunction({ name: 'desktop-' + name, data: data as object });
  return unwrap<T>(result.result as any);
}
export async function cloudRequest<T = any>(
  path: string,
  method: string,
  body: any = {},
): Promise<T> {
  if (path === '/auth/login') {
    const login = await client()
      .auth()
      .signInWithPassword({ username: body.account, password: body.password });
    if (login.error) throw Error(login.error.message);
    const identity = await callCloud('auth-login');
    return { token: 'cloud-session', role: identity.role } as T;
  }
  if (path === '/auth/logout') {
    await client().auth().signOut();
    return undefined as T;
  }
  const fixed: Record<string, string> = {
    '/packages': method === 'GET' ? 'package-list' : 'package-save',
    '/settings': method === 'GET' ? 'store-settings' : 'store-settings-save',
    '/orders': 'order-list',
    '/statistics': 'statistics-summary',
    '/export': 'data-export',
    '/backup': 'data-backup',
    '/restore': 'data-restore',
    '/tasks': 'task-list',
    '/sync': 'sync-status',
    '/expired-files': 'expired-files-cleanup',
    '/expired-files/cleanup': 'expired-files-cleanup',
    '/offline-orders': 'booking-create',
  };
  let name = fixed[path],
    data = body;
  const match = path.match(/^\/orders\/([^/]+)(?:\/(.+))?$/);
  if (match) {
    data = { ...body, id: match[1] };
    name =
      (
        {
          cancel: 'booking-cancel',
          reopen: 'photo-selection-reopen',
          confirm: 'delivery-confirm',
          retouch: 'retouch-update',
          printing: 'print-task-update',
          reschedule: 'booking-reschedule',
        } as Record<string, string>
      )[match[2]] || (method === 'GET' ? 'order-detail' : 'order-update-status');
  }
  if (path.startsWith('/packages/')) {
    name = 'package-save';
    data = { ...body, id: path.split('/')[2] };
  }
  if (path.startsWith('/customers/')) {
    name = 'customer-note';
    data = { ...body, id: path.split('/')[2], method };
  }
  if (path.startsWith('/slots?')) {
    name = 'booking-timeslots';
    data = { date: path.split('date=')[1] };
  }
  if (path === '/offline-orders') {
    const slots = await callCloud<any[]>('booking-timeslots', { date: body.date });
    const slot = slots.find((s) => s.time === body.time);
    if (!slot) throw Error('时段已关闭');
    data = { ...body, slotId: slot.id };
  }
  if (!name) throw Error('云端接口映射缺失：' + path);
  if(path==='/orders'){const rows:any[]=[];for(let page=0;page<10000;page++){const batch=await callCloud<any[]>('order-list',{page});rows.push(...batch);if(batch.length<50)break}return rows as T}if(path==='/expired-files')return (await callCloud('expired-files-cleanup')).files as T;return callCloud<T>(name,data);
}
