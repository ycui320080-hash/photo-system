import type { ApiResponse } from '../types/models';
export interface Transport {
  request<T>(path: string, method?: string, body?: unknown): Promise<T>;
}
export function unwrap<T>(r: ApiResponse<T>): T {
  if (!r.ok) throw Error(r.error || '请求失败');
  return r.data as T;
}
