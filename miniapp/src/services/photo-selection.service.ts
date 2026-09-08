import { api } from './api';
export const selectPhotos = (id: string, photos: unknown) =>
  api('/orders/' + id + '/selection', 'POST', { photos });
