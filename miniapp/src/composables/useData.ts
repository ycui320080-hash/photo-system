import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
export function useData(loader: () => Promise<any>, initial: any = []) {
  const data = ref<any>(initial),
    error = ref(''),
    busy = ref(false);
  async function reload() {
    busy.value = true;
    error.value = '';
    try {
      data.value = await loader();
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      busy.value = false;
    }
  }
  onShow(reload);
  return { data, error, busy, reload };
}
export const go = (page: string) =>
  uni.navigateTo({
    url:
      '/pages/' +
      page.split('?')[0] +
      '/index' +
      (page.includes('?') ? '?' + page.split('?')[1] : ''),
  });
