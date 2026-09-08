import { validateUpload } from '../../../shared/validators/upload.validator';
export function createPhotoForm(files: File[], kind: string) {
  if (!files.length) throw Error('请选择照片');
  const form = new FormData();
  for (const file of files) {
    validateUpload(file.type, file.size, files.length);
    form.append('files', file);
  }
  form.append('kind', kind);
  return form;
}
