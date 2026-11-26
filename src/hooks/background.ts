export const previewUrl = (url: string) =>
  url
    .replace(
      /((?:month-\d{2}|term-[^/]+|festival-[^/]+))\.webp$/,
      '$1-preview.webp',
    )
    .replace(/(picsum\.photos\/id\/\d+)\/\d+\/\d+\.webp$/, '$1/320/180.webp');
export async function loadDecodedImage(
  url: string,
  create: () => { src: string; decode: () => Promise<void> } = () =>
    new Image(),
) {
  const image = create();
  image.src = url;
  await image.decode();
  return url;
}
