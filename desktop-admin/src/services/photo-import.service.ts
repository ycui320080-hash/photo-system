import { base } from './api';
import { createPhotoForm } from './image-process.service';
export async function uploadPhotos(id: string, files: File[], kind: string, uploadKey = '') {
  if (import.meta.env.VITE_MODE === 'cloudbase') {
    const { callCloud } = await import('./cloudbase.adapter');
    let order;
    for (const file of files) {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = () => reject(Error('照片读取失败'));
        reader.readAsDataURL(file);
      });
      order = await callCloud(kind === 'delivery' ? 'delivery-create' : 'photo-preview-upload', {
        id,
        base64,
        uploadKey,
      });
    }
    return order;
  }
  const response = await fetch(base + '/orders/' + id + '/photos', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + (sessionStorage.getItem('token') || localStorage.getItem('token')) },
    body: createPhotoForm(files, kind),
  });
  const result = await response.json();
  if (!result.ok) throw Error(result.error);
  return result.data;
}
