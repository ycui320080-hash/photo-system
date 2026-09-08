import { cloudPrint } from './cloud-upload.service';
import { api, base } from './api';
export async function submitPrint(paths: string[], form: Record<string, string>): Promise<any> {
  if (import.meta.env.VITE_MODE === 'cloudbase') return cloudPrint(paths, form);
  await api('/profile');
  // #ifdef H5
  const data = new FormData();
  for (const p of paths) {
    const b = await (await fetch(p)).blob();
    data.append('files', b, 'photo.jpg');
  }
  for (const [k, v] of Object.entries(form)) data.append(k, v);
  const r = await fetch(base + '/print-orders', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + uni.getStorageSync('token') },
    body: data,
  });
  const result = await r.json();
  if (!result.ok) throw Error(result.error);
  return result.data;
  // #endif
  // #ifdef MP-WEIXIN
  if (paths.length !== 1) throw Error('微信演示版每次冲印一张，请分次提交');
  return new Promise((resolve, reject) =>
    uni.uploadFile({
      url: base + '/print-orders',
      filePath: paths[0],
      name: 'files',
      formData: form,
      header: { Authorization: 'Bearer ' + uni.getStorageSync('token') },
      success: (r) => {
        const result = JSON.parse(r.data);
        if (result.ok) {
          resolve(result.data);
        } else {
          reject(Error(result.error));
        }
      },
      fail: () => reject(Error('上传失败，请重试')),
    }),
  );
  // #endif
}
