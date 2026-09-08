import { cloudRequest } from './cloudbase.adapter';
import { unwrap } from '../../../shared/api/client';
export const base = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8787') + '/api';
export async function api<T = any>(path: string, method = 'GET', body?: unknown): Promise<T> {
  if (import.meta.env.VITE_MODE === 'cloudbase') return cloudRequest<T>(path, method, body);
  if (!uni.getStorageSync('token') && path != '/auth/customer') {
    const session = await api<{ token: string }>('/auth/customer', 'POST', {});
    uni.setStorageSync('token', session.token);
  }
  return new Promise((resolve, reject) =>
    uni.request({
      url: base + path,
      method: method as 'GET',
      data: body as object,
      header: { Authorization: 'Bearer ' + uni.getStorageSync('token') },
      success: (r) => {
        try {
          const response = r.data as any;
          if (!response.ok && response.error === '请先登录' && path !== '/auth/customer') {
            uni.removeStorageSync('token');
            api<T>(path, method, body).then(resolve, reject);
            return;
          }
          resolve(unwrap<T>(response));
        } catch (e) {
          reject(e);
        }
      },
      fail: () => reject(Error('连接失败，请启动本地服务')),
    }),
  );
}
