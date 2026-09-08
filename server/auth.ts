import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

const sessions = new Map<string, { id: string; role: string; expiresAt: number }>();
const accounts = new Map<string, { salt: Buffer; hash: Buffer; role: string }>();
const attempts = new Map<string, { count: number; until: number }>();
const mockMode = () => (process.env.VITE_APP_MODE || process.env.VITE_MODE || 'mock') === 'mock' && process.env.NODE_ENV !== 'production';

export function initAuth() {
  accounts.clear();
  sessions.clear();
  if (!mockMode()) {
    console.log('生产模式未启用测试管理员，请接入正式身份服务');
    return;
  }
  const account = process.env.VITE_TEST_ADMIN_USERNAME || 'admin';
  const password = process.env.VITE_TEST_ADMIN_PASSWORD || '123456';
  const salt = randomBytes(16);
  accounts.set(account, { salt, hash: scryptSync(password, salt, 64), role: 'admin' });
  console.log('测试管理员 ' + account + ' / ' + password);
}
export function login(account: string, password: string) {
  const previous = attempts.get(account);
  if (previous && previous.until > Date.now() && previous.count >= 10) throw Error('尝试过多，请一分钟后重试');
  const record = previous && previous.until > Date.now() ? previous : { count: 0, until: Date.now() + 60000 };
  record.count++;
  attempts.set(account, record);
  const current = accounts.get(account);
  if (!current || typeof password !== 'string' || !timingSafeEqual(current.hash, scryptSync(password, current.salt, 64)))
    throw Error('账号或密码错误，请使用测试账号 admin / 123456');
  attempts.delete(account);
  return issue(account, current.role);
}
export function issue(id: string, role: string) {
  const token = randomBytes(32).toString('hex');
  sessions.set(token, { id, role, expiresAt: Date.now() + 8 * 3600000 });
  return { token, role };
}
export function actor(req: Request) {
  const token = req.headers.authorization?.replace('Bearer ', '') || '';
  const current = sessions.get(token);
  if (!current || current.expiresAt <= Date.now()) {
    sessions.delete(token);
    throw Error('请先登录');
  }
  return current;
}
export function staff(req: Request, _requireAdmin = false) {
  const current = actor(req);
  if (current.role !== 'admin') throw Error('没有操作权限');
  return current;
}
export function logout(req: Request) {
  sessions.delete(req.headers.authorization?.replace('Bearer ', '') || '');
}