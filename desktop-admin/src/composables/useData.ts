import { ref, onMounted } from 'vue';
export function useData<T>(loader: () => Promise<T>, initial: T) {
  const data = ref<any>(initial),
    busy = ref(false),
    error = ref('');
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
  onMounted(reload);
  return { data, busy, error, reload };
}
