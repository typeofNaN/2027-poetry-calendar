export const imageUrl = (url: string, base: string) => {
  if (/^https:\/\//.test(url)) return url;
  const host = import.meta.env.VITE_ILLUSTRATION_BASE_URL?.trim();
  if (host && url.startsWith('illustrations/'))
    return host.replace(/\/$/, '') + '/' + url.slice('illustrations/'.length);
  return base + url.replace(/^\//, '');
};
