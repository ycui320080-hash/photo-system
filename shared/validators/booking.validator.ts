import type { BookingInput } from '../types/models';
export function validateBooking(x: BookingInput) {
  if (!x.name?.trim() || x.name.length > 40) throw Error('请填写姓名，最多40字');
  if (!/^1[3-9]\d{9}$/.test(x.phone) && x.phone !== '00000000000')
    throw Error('请填写有效手机号，演示可用00000000000');
  if (!Number.isInteger(x.people) || x.people < 1 || x.people > 20) throw Error('人数为1至20人');
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(x.date) ||
    !/^\d{2}:\d{2}$/.test(x.time) ||
    Date.parse(x.date + 'T' + x.time + ':00+08:00') <= Date.now()
  )
    throw Error('请选择未来预约时间');
  if (!x.requestId || x.requestId.length > 100) throw Error('缺少提交编号');
}
