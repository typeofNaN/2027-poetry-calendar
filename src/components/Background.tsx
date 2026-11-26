import { useEffect, useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { loadDecodedImage, previewUrl } from '../hooks/background';

export function Background({
  url,
  fallback,
  neighbors,
}: {
  url: string;
  fallback: string;
  neighbors: string[];
}) {
  const [shown, setShown] = useState(fallback);
  const shownRef = useRef(fallback);
  const [preview, setPreview] = useState('');
  const [previous, setPrevious] = useState(fallback);
  const [settled, setSettled] = useState('');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      if (active) {
        shownRef.current = fallback;
        setShown(fallback);
        setSettled(url);
        setFailed(true);
      }
    }, 18000);
    loadDecodedImage(previewUrl(url))
      .then((src) => {
        if (active) setPreview(src);
      })
      .catch(() => {});
    loadDecodedImage(url)
      .then((src) => {
        if (active) {
          setPrevious(shownRef.current);
          shownRef.current = src;
          setShown(src);
          setSettled(url);
          setFailed(false);
          window.clearTimeout(timer);
        }
      })
      .catch(() => {
        if (active) {
          shownRef.current = fallback;
          setShown(fallback);
          setSettled(url);
          setFailed(true);
          window.clearTimeout(timer);
        }
      });
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [url, fallback]);
  useEffect(() => {
    if (settled !== url || failed) return;
    const timer = window.setTimeout(
      () =>
        neighbors.forEach((src) => {
          void loadDecodedImage(src).catch(() => {});
        }),
      1800,
    );
    return () => window.clearTimeout(timer);
  }, [neighbors, settled, url, failed]);
  const loading = settled !== url;
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 overflow-hidden bg-stone-200 dark:bg-stone-900"
      >
        <img
          src={loading ? shown : previous}
          alt=""
          className="absolute size-full object-cover object-bottom"
        />
        {loading && preview === previewUrl(url) && (
          <img
            src={preview}
            alt=""
            className="absolute size-full scale-105 object-cover object-bottom blur-lg"
          />
        )}
        {!loading && (
          <img
            key={shown}
            src={shown}
            alt=""
            className="background-reveal absolute size-full object-cover object-bottom"
          />
        )}
      </div>
      <div
        role="status"
        aria-live="polite"
        className={
          loading || failed
            ? 'pointer-events-none absolute bottom-28 right-6 z-10 rounded-full bg-background/95 px-3 py-2 text-xs text-foreground shadow-sm md:right-12'
            : 'sr-only'
        }
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <LoaderCircle className="size-3.5 animate-spin" />
            正在铺展今日风景…
          </span>
        ) : failed ? (
          '风景暂未加载，已展示备用插画'
        ) : (
          <span className="sr-only">背景已加载</span>
        )}
      </div>
    </>
  );
}
