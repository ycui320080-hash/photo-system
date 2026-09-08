import { list } from '../db';
import type { Order } from '../../shared/types/models';
export function summary() {
  const orders = list<Order>('orders').filter((o) => o.status !== '已取消');
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' }),
    month = today.slice(0, 7);
  const midnight = Date.parse(today + 'T00:00:00+08:00'),
    weekStart = midnight - ((new Date(today + 'T12:00:00+08:00').getUTCDay() + 6) % 7) * 86400000;
  const periods = Object.fromEntries(
    [
      ['日', midnight],
      ['周', weekStart],
      ['月', Date.parse(month + '-01T00:00:00+08:00')],
    ].map(([label, start]) => {
      const current = orders.filter((o) => Date.parse(o.createdAt) >= Number(start));
      const payments = list<{ amount: number; createdAt: string }>('payments').filter(
        (p) => Date.parse(p.createdAt) >= Number(start),
      );
      return [
        label,
        { orders: current.length, revenue: payments.reduce((n, p) => n + p.amount, 0) },
      ];
    }),
  );
  return {
    total: orders.length,
    revenue: orders.reduce((s, o) => s + o.paid, 0),
    unpaid: orders.reduce((s, o) => s + o.amount - o.paid, 0),
    today: orders.filter(
      (o) =>
        o.appointment &&
        new Date(o.appointment).toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' }) ===
          today,
    ).length,
    month: orders.filter(
      (o) =>
        new Date(o.createdAt)
          .toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' })
          .slice(0, 7) === month,
    ).length,
    periods,
    statuses: Object.fromEntries(
      [...new Set(orders.map((o) => o.status))].map((s) => [
        s,
        orders.filter((o) => o.status === s).length,
      ]),
    ),
    packages: Object.fromEntries(
      [...new Set(orders.map((o) => o.packageName))].map((s) => [
        s,
        orders.filter((o) => o.packageName === s).length,
      ]),
    ),
  };
}
