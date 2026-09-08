export interface SyncJob {
  id: string;
  name: string;
  status: string;
  attempts: number;
  last_error: string;
}
interface CloudJob {
  id: string;
  orderId: string;
  kind: string;
  name: string;
  bytes: Uint8Array;
}
declare global {
  interface Window {
    studio?: {
      importPhotos(input: {
        orderId: string;
        token: string;
        kind: string;
      }): Promise<{ cancelled?: boolean; jobs?: SyncJob[] }>;
      retryPhotos(input: { token: string }): Promise<{ jobs: SyncJob[] }>;
      syncStatus(): Promise<{ jobs: SyncJob[]; directory: string }>;
      chooseDirectory(): Promise<string>;
      readCloudPhotos(input: { orderId?: string; kind?: string }): Promise<CloudJob[]>;
      cloudPhotoResult(input: { jobId: string; photoId?: string; error?: string }): Promise<void>;
    };
  }
}
export const desktopAvailable = () => !!window.studio;
async function uploadCloudJobs(orderId?: string, kind?: string) {
  const jobs = await window.studio!.readCloudPhotos({ orderId, kind });
  const { uploadPhotos } = await import('./photo-import.service');
  for (const job of jobs) {
    try {
      const ext = job.name.split('.').pop()?.toLowerCase(),
        mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      const file = new File([new Uint8Array(job.bytes)], job.name, { type: mime });
      const order = await uploadPhotos(job.orderId, [file], job.kind, job.id);
      const photos = job.kind === 'delivery' ? order.delivery : order.photos;
      await window.studio!.cloudPhotoResult({
        jobId: job.id,
        photoId: photos[photos.length - 1].id,
      });
    } catch (e) {
      await window.studio!.cloudPhotoResult({ jobId: job.id, error: (e as Error).message });
    }
  }
  return { cancelled: false, ...(await window.studio!.syncStatus()) };
}
export const importLocal = (orderId: string, kind: string) =>
  import.meta.env.VITE_MODE === 'cloudbase'
    ? uploadCloudJobs(orderId, kind)
    : window.studio!.importPhotos({ orderId, kind, token: (sessionStorage.getItem('token') || localStorage.getItem('token')) || '' });
export const retryLocal = () =>
  import.meta.env.VITE_MODE === 'cloudbase'
    ? uploadCloudJobs()
    : window.studio!.retryPhotos({ token: (sessionStorage.getItem('token') || localStorage.getItem('token')) || '' });
