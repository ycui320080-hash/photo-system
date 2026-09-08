import { unwrap } from '../../../shared/api/client';

export const base = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8787') + '/api';

export function storedToken() {
  return sessionStorage.getItem('token') || localStorage.getItem('token') || '';
}

function clearSession() {
  sessionStorage.clear();
  localStorage.removeItem('token');
  localStorage.removeItem('role');
}

export async function api<T = any>(path: string, method = 'GET', body?: unknown): Promise<T> {
  if (import.meta.env.VITE_MODE === 'cloudbase') {
    const { cloudRequest } = await import('./cloudbase.adapter');
    return cloudRequest<T>(path, method, body);
  }
  const response = await fetch(base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + storedToken(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json();
  if (!result.ok && result.error === '请先登录') {
    clearSession();
    if (window.location.hash !== '#/login') window.location.hash = '#/login';
  }
  return unwrap<T>(result);
}

export async function photoUrl(id: string) {
  if (import.meta.env.VITE_MODE === 'cloudbase') {
    const { callCloud } = await import('./cloudbase.adapter');
    return (await callCloud('photo-file-get', { id })).url;
  }
  const response = await fetch(base + '/files/' + id, {
    headers: { Authorization: 'Bearer ' + storedToken() },
  });
  if (!response.ok) throw Error('图片读取失败或已过期');
  return URL.createObjectURL(await response.blob());
}