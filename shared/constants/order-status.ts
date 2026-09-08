export const statuses = [
  '待确认',
  '待到店',
  '已拍摄',
  '待上传预览图',
  '待选片',
  '修图中',
  '待顾客确认',
  '待打印',
  '待取件',
  '已完成',
  '已取消',
] as const;
export type OrderStatus = (typeof statuses)[number];
