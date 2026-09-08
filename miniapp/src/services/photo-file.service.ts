import { base } from './api';
import { cloudCall } from './cloudbase.adapter';
export async function fileUrl(id: string): Promise<string> {
  if (import.meta.env.VITE_MODE === 'cloudbase') {
    const link = await cloudCall('photo-file-get', { id });
    return new Promise((resolve, reject) =>
      uni.downloadFile({
        url: link.url,
        success: (r) =>
          r.statusCode === 200 ? resolve(r.tempFilePath) : reject(Error('文件下载失败')),
        fail: () => reject(Error('文件下载失败')),
      }),
    );
  }
  return new Promise((resolve, reject) =>
    uni.downloadFile({
      url: base + '/files/' + id,
      header: { Authorization: 'Bearer ' + uni.getStorageSync('token') },
      success: (r) =>
        r.statusCode === 200 ? resolve(r.tempFilePath) : reject(Error('文件已过期或无权访问')),
      fail: () => reject(Error('文件读取失败，可重试')),
    }),
  );
}
