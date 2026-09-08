export type GraduationPackage = {
  id: string;
  name: string;
  category: '单人写真' | '多人合影' | '校园跟拍' | '班级集体照';
  price: string;
  description: string;
  features: string[];
};

export const graduationPackages: GraduationPackage[] = [
  {
    id: 'p8',
    name: '单人毕业写真',
    category: '单人写真',
    price: '¥299起',
    description: '一场属于自己的校园纪念拍摄',
    features: ['学士服拍摄', '校园取景', '精修照片', '电子相册'],
  },
  {
    id: 'p10',
    name: '宿舍合照',
    category: '多人合影',
    price: '¥499起',
    description: '和朝夕相处的室友认真告别',
    features: ['多人合影', '宿舍与校园取景', '精修照片'],
  },
  {
    id: 'p13',
    name: '校园跟拍',
    category: '校园跟拍',
    price: '¥399起',
    description: '把熟悉的路和年轻的你一起留下',
    features: ['2小时拍摄', '全部底片', '精修照片'],
  },
  {
    id: 'p12',
    name: '班级集体照',
    category: '班级集体照',
    price: '到店咨询',
    description: '支持班级、社团与毕业小组预约',
    features: ['多人统筹', '队形建议', '校园取景'],
  },
];