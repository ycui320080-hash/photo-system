import sharp from 'sharp';
export async function processPhoto(
  bytes: Buffer,
  options: { final: boolean; quality: number; watermark: string },
) {
  const resized = await sharp(bytes, { limitInputPixels: 40000000 })
    .rotate()
    .resize({ width: options.final ? 3000 : 1200, withoutEnlargement: true })
    .toBuffer();
  let image = sharp(resized);
  if (!options.final) {
    const meta = await image.metadata(),
      width = Math.min(700, meta.width || 700),
      height = Math.min(140, meta.height || 140);
    const safe = options.watermark.replace(/[<>&"']/g, '');
    const font = Math.max(8, Math.min(30, width / 22, height / 3));
    const overlay = Buffer.from(
      '<svg width="' +
        width +
        '" height="' +
        height +
        '"><rect width="100%" height="100%" fill="white" fill-opacity="0.65"/><text x="4" y="' +
        Math.round(height / 2 + font / 3) +
        '" font-size="' +
        font +
        '" fill="#333">' +
        safe +
        '</text></svg>',
    );
    image = image.composite([{ input: overlay, gravity: 'center' }]);
  }
  const preview = await image.jpeg({ quality: options.final ? 90 : options.quality }).toBuffer();
  const thumbnail = await sharp(preview)
    .resize({ width: 320, withoutEnlargement: true })
    .jpeg({ quality: 70 })
    .toBuffer();
  return { preview, thumbnail };
}
