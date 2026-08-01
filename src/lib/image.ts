export const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
export const maxImageBytes = 10 * 1024 * 1024;

export interface PreparedImage {
  originalFile: File;
  file: File;
  width: number;
  height: number;
  sha256: string;
  previewUrl: string;
}

async function digest(file: Blob): Promise<string> {
  const value = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return [...new Uint8Array(value)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function prepareImage(original: File): Promise<PreparedImage> {
  if (!acceptedImageTypes.includes(original.type)) throw new Error('INVALID_IMAGE_TYPE');
  if (original.size > maxImageBytes) throw new Error('IMAGE_TOO_LARGE');

  const bitmap = await createImageBitmap(original);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('IMAGE_PROCESSING_UNAVAILABLE');
  context.fillStyle = '#f3f0ea';
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) => (value ? resolve(value) : reject(new Error('IMAGE_COMPRESSION_FAILED'))),
      'image/webp',
      0.82
    )
  );
  const file = new File([blob], `${crypto.randomUUID()}.webp`, { type: 'image/webp' });
  return {
    originalFile: original,
    file,
    width,
    height,
    sha256: await digest(original),
    previewUrl: URL.createObjectURL(file)
  };
}
