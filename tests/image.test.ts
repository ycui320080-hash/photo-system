import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { processPhoto } from '../server/services/image-process.service';
test('小尺寸及极端宽高比照片均可生成水印预览与缩略图', async () => {
  for (const [width, height] of [
    [295, 413],
    [5000, 100],
    [20, 20],
  ]) {
    const input = await sharp({ create: { width, height, channels: 3, background: '#eadccb' } })
      .png()
      .toBuffer();
    const output = await processPhoto(input, {
      final: false,
      quality: 75,
      watermark: '校园照相馆',
    });
    const meta = await sharp(output.preview).metadata(),
      thumb = await sharp(output.thumbnail).metadata();
    assert.ok(meta.width! <= 1200);
    assert.ok(thumb.width! <= 320);
    assert.equal(meta.format, 'jpeg');
  }
});
