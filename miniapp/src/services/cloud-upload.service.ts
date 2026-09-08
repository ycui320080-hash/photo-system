import { cloudCall } from './cloudbase.adapter';
export async function cloudPrint(paths: string[], form: Record<string, string>) {
  const photoIds: string[] = [];
  for (const path of paths) {
    const base64 = await new Promise<string>((resolve, reject) =>
      uni
        .getFileSystemManager()
        .readFile({
          filePath: path,
          encoding: 'base64',
          success: (r) => resolve(String(r.data)),
          fail: () => reject(Error('读取照片失败')),
        }),
    );
    photoIds.push((await cloudCall('print-source-upload', { base64 })).id);
  }
  return cloudCall('print-order-create', { ...form, photoIds });
}
