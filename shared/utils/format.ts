export const money = (cents: number) => (cents / 100).toFixed(2);
export const chinaTime = (value: string) =>
  new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
export const maskPhone = (s: string) => s.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
