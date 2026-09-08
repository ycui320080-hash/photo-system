export function validateUpload(type: string, size: number, count = 1) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(type))
    throw Error('仅支持JPG、PNG、WebP图片');
  if (size > 10 * 1024 * 1024 || size < 1) throw Error('单张图片限制10MB');
  if (count < 1 || count > 20) throw Error('每次选择1至20张照片');
}
