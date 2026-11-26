import { expect, test, vi } from 'vitest';
import { loadDecodedImage, previewUrl } from './background';
test('uses same fixed Picsum ID for small preview', () => {
  expect(previewUrl('https://picsum.photos/id/25/1920/1080.webp')).toBe(
    'https://picsum.photos/id/25/320/180.webp',
  );
  expect(previewUrl('/backgrounds/spring.webp')).toBe(
    '/backgrounds/spring.webp',
  );
});
test('waits for decoding before resolving and surfaces failures', async () => {
  const decode = vi.fn().mockResolvedValue(undefined);
  const image = { src: '', decode };
  await loadDecodedImage('/photo.webp', () => image);
  expect(image.src).toBe('/photo.webp');
  expect(decode).toHaveBeenCalledOnce();
  await expect(
    loadDecodedImage('/bad.webp', () => ({
      src: '',
      decode: () => Promise.reject(new Error('failed')),
    })),
  ).rejects.toThrow('failed');
});
test('generated illustrations use their small preview on local and hosted URLs', () => {
  expect(previewUrl('/illustrations/month-01.webp')).toBe(
    '/illustrations/month-01-preview.webp',
  );
  expect(previewUrl('https://cdn.example/art/term-qingming.webp')).toBe(
    'https://cdn.example/art/term-qingming-preview.webp',
  );
});
