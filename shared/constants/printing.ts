export const printPrices: Record<string, number> = {
  '5寸': 150,
  '6寸': 200,
  '7寸': 350,
  '一寸证件照': 500,
  '二寸证件照': 600,
};
const paperSurcharge: Record<string, number> = { 光面: 0, 绒面: 50, 复古: 100 };
export function printAmount(size: string, quantity: number, paper: string, laminate: boolean, count: number) {
  if (!(size in printPrices) || !Number.isInteger(quantity) || quantity < 1 || quantity > 100 ||
      !(paper in paperSurcharge) || count < 1 || count > 20) throw Error('冲印参数无效');
  return (printPrices[size] + paperSurcharge[paper] + (laminate ? 100 : 0)) * quantity * count;
}