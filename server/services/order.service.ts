import { get, save, log } from '../db';
import type { Order } from '../../shared/types/models';
import { statuses } from '../../shared/constants/order-status';
export function accessible(id: string, a: { id: string; role: string }) {
  const o = get<Order>('orders', id);
  if (a.role === 'customer' && o.userId !== a.id) throw Error('没有订单访问权限');
  return o;
}
export function update(o: Order, input: Partial<Order>, actor: string) {
  if (input.status) {
    if (input.status === '已取消' && o.paid > 0)
      throw Error('已收款订单请先线下处理退款，本版不支持直接取消');
    const current = statuses.indexOf(o.status),
      next = statuses.indexOf(input.status);
    if (
      next < 0 ||
      o.status === '已取消' ||
      o.status === '已完成' ||
      (next !== current + 1 && input.status !== '已取消')
    )
      throw Error('请按处理流程推进状态');
    o.status = input.status;
    o.history.push({ status: o.status, at: new Date().toISOString() });
  }
  if (input.paid !== undefined) {
    if (!Number.isInteger(input.paid) || input.paid < o.paid || input.paid > o.amount)
      throw Error('累计收款金额无效');
    save('payments', {
      id: crypto.randomUUID(),
      orderId: o.id,
      amount: input.paid - o.paid,
      actor,
      method: 'offline',
      status: 'recorded',
      createdAt: new Date().toISOString(),
    });
    o.paid = input.paid;
  }
  if (input.internalNote !== undefined) o.internalNote = String(input.internalNote).slice(0, 1000);
  o.updatedAt = new Date().toISOString();
  save('orders', o);
  log(actor, 'order-update', o.id);
  return o;
}
