import { expect, test } from 'vitest';
import { imageUrl } from './image';
test('keeps external artwork URLs and resolves local fallback under repository base', () => {
  expect(imageUrl('https://museum.org/art.jpg', '/calendar/')).toBe(
    'https://museum.org/art.jpg',
  );
  expect(imageUrl('backgrounds/winter.webp', '/calendar/')).toBe(
    '/calendar/backgrounds/winter.webp',
  );
});
