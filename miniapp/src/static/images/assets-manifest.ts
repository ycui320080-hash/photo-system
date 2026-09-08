export interface ImageAsset {
  id: string;
  path: string;
  purpose: string;
  alt: string;
  temporary: boolean;
  replacement: string;
}

export const homeImageAssets: ImageAsset[] = [
  {
    id: 'campus-hero',
    path: '/static/images/camp/campus-hero.jpg',
    purpose: '首页校园主视觉',
    alt: '夕阳下学生走过校园林荫路',
    temporary: true,
    replacement: '安徽工程大学校园主视觉实拍',
  },
  {
    id: 'campus-tree-shade',
    path: '/static/images/home/campus-tree-shade.jpg',
    purpose: '主视觉树荫照片',
    alt: '阳光穿过树叶的校园道路',
    temporary: true,
    replacement: '安徽工程大学林荫道实拍',
  },
  {
    id: 'graduation-female',
    path: '/static/images/home/graduation-portrait-female.jpg',
    purpose: '毕业写真服务入口',
    alt: '女生毕业写真样片',
    temporary: true,
    replacement: '店主授权的女生毕业写真',
  },
  {
    id: 'graduation-male',
    path: '/static/images/home/graduation-portrait-male.jpg',
    purpose: '单人毕业写真套餐',
    alt: '男生毕业写真样片',
    temporary: true,
    replacement: '店主授权的男生毕业写真',
  },
  {
    id: 'dorm-group',
    path: '/static/images/home/dorm-group.jpg',
    purpose: '宿舍多人合照套餐',
    alt: '宿舍同学自然合照',
    temporary: true,
    replacement: '店主授权的宿舍合照',
  },
  {
    id: 'photographer-at-work',
    path: '/static/images/home/photographer-at-work.jpg',
    purpose: '校园跟拍服务入口',
    alt: '摄影师为毕业生拍摄',
    temporary: true,
    replacement: '店主摄影师工作照',
  },
  {
    id: 'campus-follow-shoot',
    path: '/static/images/home/campus-follow-shoot.jpg',
    purpose: '校园跟拍套餐',
    alt: '校园林荫路上的跟拍现场',
    temporary: true,
    replacement: '店主授权的校园跟拍现场照',
  },
  {
    id: 'class-group',
    path: '/static/images/home/class-group.jpg',
    purpose: '班级集体照套餐',
    alt: '毕业班级集体合照',
    temporary: true,
    replacement: '店主授权的班级集体照',
  },
  {
    id: 'id-photo-female',
    path: '/static/images/id-photo/id-photo-sample.jpg',
    purpose: '证件照服务入口',
    alt: '女性证件照样片',
    temporary: true,
    replacement: '店主授权的女性证件照样片',
  },
  {
    id: 'id-photo-female-secondary',
    path: '/static/images/home/id-photo-female-secondary.jpg',
    purpose: '学生证件照套餐女性样片',
    alt: '短发女性证件照样片',
    temporary: true,
    replacement: '店主授权的第二张女性证件照样片',
  },
  {
    id: 'id-photo-male',
    path: '/static/images/home/id-photo-male.jpg',
    purpose: '学生证件照套餐男性样片',
    alt: '男性证件照样片',
    temporary: true,
    replacement: '店主授权的男性证件照样片',
  },
  {
    id: 'printing-scene',
    path: '/static/images/printing/printing-hero.jpg',
    purpose: '在线冲印服务入口',
    alt: '桌面上的纸质照片和胶卷',
    temporary: true,
    replacement: '店内真实冲印工作台照片',
  },
  {
    id: 'photo-wall',
    path: '/static/images/home/photo-wall.jpg',
    purpose: '主视觉与纸质作品展示',
    alt: '奶油色墙面上的校园照片墙',
    temporary: true,
    replacement: '门店真实照片墙或纸质成品照片',
  },
];

export const getHomeAsset = (id: string) => homeImageAssets.find((asset) => asset.id === id);
