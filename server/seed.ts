import { list, save } from './db';
import type { Package, Settings } from '../shared/types/models';
const names = [
  '一寸证件照',
  '二寸证件照',
  '简历形象照',
  '教资报名照',
  '四六级报名照',
  '计算机等级考试报名照',
  '考研报名照',
  '公务员考试照片',
  '毕业写真',
  '学士服写真',
  '宿舍合照',
  '情侣或闺蜜写真',
  '班级集体照',
  '校园活动跟拍',
  '普通照片冲印',
];
export function seed() {
  if (!list('packages').length)
    names.forEach((name, i) =>
      save<Package>('packages', {
        id: 'p' + i,
        name,
        category: i < 8 ? '证件照' : i < 14 ? '校园写真' : '照片冲印',
        image: '',
        originalPrice: i < 8 ? 4900 : 19900,
        price: i < 8 ? 2900 : i < 14 ? 15900 : 200,
        description: '校园专属服务 · 自然精修 · 到店付款',
        retouchCount: i < 8 ? 1 : 6,
        duration: i < 8 ? 20 : 60,
        bookingRequired: i < 14,
        enabled: true,
        sort: i,
      }),
    );
  if (!list('store_settings').length)
    save<Settings & { id: string }>('store_settings', {
      id: 'store',
      name: '校园照相馆',
      address: '请在系统设置填写门店地址',
      phone: '',
      hours: '09:00-18:00',
      watermark: '校园照相馆 · 选片预览',
      retentionDays: 7,
      capacity: 6,
      closedDates: '',
      previewQuality: 75,
    });
}
