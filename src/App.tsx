import { PoetryReader } from './components/PoetryReader';
import { useMemo } from 'react';
import { Background } from './components/Background';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Switch } from './components/ui/switch';
import { Slider } from './components/ui/slider';
import { Label } from './components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';
function Choice({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
import { imageUrl } from './hooks/image';
import { useEffect, useRef, useState } from 'react';
import {
  CalendarDays,
  Heart,
  Settings,
  Maximize,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Share2,
  BookOpen,
} from 'lucide-react';
import { Converter } from 'opencc-js';
import records from './data/calendar/2027.json';
import {
  beijingDate,
  clampDate,
  shiftDate,
  START,
  END,
} from './hooks/calendar';
const traditional = Converter({ from: 'cn', to: 'tw' });
const base = import.meta.env.BASE_URL;
function stored<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
}
const defaults = {
  vertical: false,
  animation: true,
  date: true,
  lunar: true,
  analysis: true,
  mask: 20,
  size: 36,
  traditional: false,
};
export default function App() {
  const [date, setDate] = useState(() => {
    const q = new URLSearchParams(location.search).get('date');
    return q && records.some((r) => r.date === q)
      ? q
      : clampDate(beijingDate());
  });
  const [backgrounded, setBackgrounded] = useState(document.hidden);

  const [panel, setPanel] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() =>
    stored('favorites', []),
  );
  const [settings, setSettings] = useState(() => stored('settings', defaults));
  const [month, setMonth] = useState(Number(date.slice(5, 7)));
  const [yearView, setYearView] = useState(false);
  const [filter, setFilter] = useState('');
  const [notice, setNotice] = useState('');
  const [ratio, setRatio] = useState('9:16');
  const [immersive, setImmersive] = useState(false);
  const poster = useRef<HTMLDivElement>(null);
  const touch = useRef(0);
  const rawDay = records.find((r) => r.date === date)!;
  const day = settings.traditional
    ? (JSON.parse(traditional(JSON.stringify(rawDay))) as typeof rawDay)
    : rawDay;
  const index = records.findIndex((r) => r.date === date);
  const favorite = favorites.includes(date);
  const neighbors = useMemo(
    () =>
      [records[index - 1], records[index + 1]]
        .filter(Boolean)
        .map((r) => imageUrl(r.background.url, base)),
    [index],
  );
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);
  const navigate = (next: string) => {
    setDate(next);
    const url = new URL(location.href);
    url.searchParams.set('date', next);
    history.replaceState({}, '', url);
  };
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    let last = beijingDate();
    const update = () => {
      const now = beijingDate();
      if (now !== last) {
        last = now;
        navigate(clampDate(now));
      }
    };
    const id = setInterval(update, 1000);
    document.addEventListener('visibilitychange', update);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).matches('input,select,textarea')) return;

      if (!panel && e.key === 'ArrowLeft') navigate(shiftDate(date, -1));
      if (!panel && e.key === 'ArrowRight') navigate(shiftDate(date, 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [date, panel]);
  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(''), 3500);
      return () => clearTimeout(t);
    }
  }, [notice]);
  useEffect(() => {
    const update = () => setBackgrounded(document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  const toggle = () =>
    setFavorites(
      favorite ? favorites.filter((v) => v !== date) : [...favorites, date],
    );
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotice('已复制');
    } catch {
      setNotice('复制失败，请检查浏览器权限');
    }
  };
  const share = async () => {
    const url = new URL(location.href);
    url.searchParams.set('date', date);
    try {
      if (navigator.share)
        await navigator.share({
          title: '岁时有诗',
          text: day.poetry.content,
          url: url.href,
        });
      else await copy(url.href);
    } catch {
      setNotice('分享已取消');
    }
  };
  const download = async () => {
    if (!poster.current) return;
    try {
      const { toPng } = await import('html-to-image');
      await document.fonts.ready;
      const width = poster.current.offsetWidth;
      const height = poster.current.offsetHeight;
      const data = await toPng(poster.current, {
        width,
        height,
        pixelRatio: 1080 / width,
      });
      const link = document.createElement('a');
      link.download = `岁时有诗-${date}.png`;
      link.href = data;
      link.click();
    } catch {
      setNotice('导出失败，请重试');
    }
  };
  const open = (name: string) => {
    setPanel(name);
    setMonth(day.month);
  };
  const calendar = (m: number) => (
    <section key={m}>
      <h3>{m} 月</h3>
      <div className="grid grid-cols-7 py-4 text-center text-xs text-muted-foreground">
        {'日一二三四五六'.split('').map((x) => (
          <span key={x}>{x}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center [&_button]:h-auto [&_button]:min-h-14 [&_button]:flex-col [&_button]:gap-1 [&_small]:max-w-full [&_button]:min-w-0 [&_button]:px-0.5 [&_button]:whitespace-normal [&_small]:whitespace-normal [&_small]:break-words [&_small]:leading-tight [&_small]:text-[10px]">
        {Array.from({ length: new Date(2027, m - 1, 1).getDay() }, (_, i) => (
          <span key={'s' + i} />
        ))}
        {records
          .filter((r) => r.month === m)
          .map((r) => (
            <Button
              variant="ghost"
              className={
                r.date === date
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                  : ''
              }
              key={r.date}
              onClick={() => {
                navigate(r.date);
                setPanel('');
              }}
            >
              <b>
                {r.day}
                {favorites.includes(r.date) ? ' ·' : ''}
              </b>
              <small>{r.festivals[0] || r.solarTerm || r.lunar.dayName}</small>
            </Button>
          ))}
      </div>
    </section>
  );
  return (
    <main
      className={`relative isolate flex min-h-svh flex-col overflow-hidden px-4 py-5 text-foreground md:px-[5vw] md:py-8 ${immersive ? 'immersive' : ''}`}
      onTouchStart={(e) => {
        touch.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (
          !panel &&
          Math.abs(e.changedTouches[0].clientX - touch.current) > 70
        )
          navigate(
            shiftDate(
              date,
              e.changedTouches[0].clientX > touch.current ? -1 : 1,
            ),
          );
      }}
    >
      <Background
        url={imageUrl(day.background.url, base)}
        fallback={
          base +
          'backgrounds/' +
          ({ 春: 'spring', 夏: 'summer', 秋: 'autumn', 冬: 'winter' }[
            day.season
          ] || 'dawn') +
          '.webp'
        }
        neighbors={neighbors}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-background"
        style={{ opacity: settings.mask / 100 }}
      />
      {settings.animation && !backgrounded && (
        <div aria-hidden="true" className={`particles season-${day.season}`}>
          {Array.from({ length: 12 }, (_, i) => (
            <i
              key={i}
              style={{
                left: `${i * 8 + 2}%`,
                animationDelay: `${-i * 2}s`,
                animationDuration: `${18 + i}s`,
              }}
            />
          ))}
        </div>
      )}
      <header className="reading-surface flex items-center justify-between gap-2 rounded-2xl px-4 py-3 md:px-6">
        <a
          className="flex items-center gap-3 font-serif text-xl tracking-widest md:text-2xl [&_small]:mt-1 [&_small]:block [&_small]:font-sans [&_small]:text-[9px] [&_small]:tracking-[.2em]"
          href={base}
        >
          <span className="rounded-sm bg-primary px-2 py-2 text-sm tracking-widest text-primary-foreground [writing-mode:vertical-rl]">
            岁时
          </span>
          <span>
            岁时有诗<small>POETIC DAYS · 2027</small>
          </span>
        </a>
        <nav className="flex items-center gap-1 md:gap-3 [&_button]:px-2 md:[&_button]:px-3 [&_svg]:size-4">
          <Button
            variant="ghost"
            aria-label="日历"
            onClick={() => open('日历')}
          >
            <CalendarDays />
            <span className="hidden sm:inline">日历</span>
          </Button>
          <Button
            variant="ghost"
            aria-label="收藏"
            onClick={() => open('收藏')}
          >
            <Heart />
            <span className="hidden sm:inline">收藏</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => open('设置')}
            aria-label="设置"
          >
            <Settings />
          </Button>
          <Button
            variant="ghost"
            aria-label="全屏"
            onClick={() => {
              setImmersive(!immersive);
              if (!document.fullscreenElement)
                document.documentElement.requestFullscreen?.().catch(() => {});
              else document.exitFullscreen?.();
            }}
          >
            <Maximize />
          </Button>
        </nav>
      </header>
      <div
        className="my-6 grid flex-1 items-center gap-5 md:my-10 md:grid-cols-[1fr_2fr] md:gap-10"
        key={date}
      >
        <section className="reading-surface w-fit rounded-2xl px-6 py-5 font-serif md:px-8 [&_p]:my-2 [&_p]:text-sm [&_p]:tracking-widest">
          {settings.date && (
            <>
              <p>二〇二七 · {day.season}</p>
              <Button
                variant="ghost"
                className="!h-auto !px-0 !py-0 font-serif !text-[clamp(80px,11vw,160px)] !font-normal !leading-none tracking-tighter hover:!bg-transparent"
                onClick={() => open('日历')}
              >
                {String(day.day).padStart(2, '0')}
              </Button>
              <p className="text-foreground">
                {String(day.month).padStart(2, '0')} 月 / {day.weekdayName}
              </p>
            </>
          )}
          {settings.lunar && (
            <p className="text-muted-foreground">
              {day.lunar.year} · {day.lunar.monthName}
              {day.lunar.dayName}
            </p>
          )}
          <p>{[day.solarTerm, ...day.festivals].filter(Boolean).join(' · ')}</p>
        </section>
        <section className="reading-surface w-fit max-w-full rounded-2xl px-6 py-7 md:px-10 md:py-10">
          <p className="mb-6 text-xs tracking-[.3em] text-muted-foreground">
            一日一诗，四季皆景。
          </p>
          <h1
            className="font-serif font-normal leading-[1.9] tracking-wider [&_span]:block"
            style={{
              fontSize: `clamp(26px,4vw,${settings.size}px)`,
              writingMode: settings.vertical ? 'vertical-rl' : 'horizontal-tb',
            }}
          >
            {day.poetry.content.split(/(?<=[，。！？])/).map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </h1>
          <p className="mt-6 flex flex-wrap gap-3 font-serif text-sm tracking-wider text-muted-foreground">
            {day.poetry.dynasty} · {day.poetry.author}
            <span>《{day.poetry.title}》</span>
          </p>
          <Button
            variant="ghost"
            className="mt-5 -ml-4 h-11 gap-2.5 rounded-lg px-4 text-sm hover:bg-transparent has-[>svg]:px-4"
            onClick={() => open('完整诗词')}
          >
            品读此诗 <BookOpen size={16} />
          </Button>
        </section>
      </div>
      <footer className="reading-surface flex flex-wrap items-center justify-between gap-3 rounded-2xl px-3 py-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            aria-label="上一天"
            disabled={date === START}
            onClick={() => navigate(shiftDate(date, -1))}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate(clampDate(beijingDate()))}
          >
            今天
          </Button>
          <Button
            variant="ghost"
            aria-label="下一天"
            disabled={date === END}
            onClick={() => navigate(shiftDate(date, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
        <p className="hidden font-serif text-sm tracking-widest md:block">
          {beijingDate() < START
            ? `距离 2027 年还有 ${Math.ceil((Date.parse(START) - Date.parse(beijingDate())) / 86400000)} 天`
            : '把日子，过成诗。'}
        </p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" aria-label="收藏当日诗词" onClick={toggle}>
            <Heart fill={favorite ? 'currentColor' : 'none'} />
          </Button>
          <Button variant="ghost" aria-label="分享" onClick={share}>
            <Share2 />
          </Button>
          <Button
            variant="ghost"
            aria-label="下载海报"
            onClick={() => open('诗词海报')}
          >
            <Download />
          </Button>
        </div>
      </footer>
      <div className="reading-surface relative mt-3 flex justify-between rounded-lg px-3 py-2 text-xs [&_i]:absolute [&_i]:bottom-0 [&_i]:left-0 [&_i]:h-0.5 [&_i]:bg-primary">
        <span>第 {index + 1} / 365 天</span>
        <span>
          距年末 {364 - index} 天 · {(((index + 1) / 365) * 100).toFixed(2)}%
        </span>
        <i style={{ width: `${((index + 1) / 365) * 100}%` }} />
      </div>
      {notice && (
        <div
          className="fixed bottom-24 left-1/2 z-[100] -translate-x-1/2 rounded-xl bg-foreground px-5 py-3 text-sm text-background shadow-lg"
          role="status"
        >
          {notice}
        </div>
      )}
      {immersive && (
        <Button
          variant="ghost"
          className="absolute right-5 top-5 z-20 bg-background text-foreground"
          onClick={() => setImmersive(false)}
        >
          退出沉浸
        </Button>
      )}
      <Dialog
        open={!!panel}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPanel('');
        }}
      >
        <DialogContent className="max-h-[88svh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{panel}</DialogTitle>
            <DialogDescription>一日一诗，随心品读与珍藏。</DialogDescription>
          </DialogHeader>
          {panel === '日历' && (
            <>
              <div className="flex items-center justify-between gap-3">
                <Choice
                  label="月份"
                  value={String(month)}
                  onChange={(v) => setMonth(Number(v))}
                  options={Array.from({ length: 12 }, (_, i) => ({
                    value: String(i + 1),
                    label: `${i + 1} 月`,
                  }))}
                />
                <Button variant="ghost" onClick={() => setYearView(!yearView)}>
                  {yearView ? '月历' : '全年'}
                </Button>
              </div>
              <div className={yearView ? 'grid gap-6 sm:grid-cols-2' : ''}>
                {yearView
                  ? Array.from({ length: 12 }, (_, i) => calendar(i + 1))
                  : calendar(month)}
              </div>
            </>
          )}
          {panel === '收藏' && (
            <>
              <Input
                aria-label="筛选作者或季节"
                placeholder="筛选作者或季节"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              {records
                .filter(
                  (r) =>
                    favorites.includes(r.date) &&
                    (!filter || (r.poetry.author + r.season).includes(filter)),
                )
                .map((r) => (
                  <div
                    className="flex items-center justify-between gap-2 border-b py-3 [&_button:first-child]:h-auto [&_button:first-child]:flex-col [&_button:first-child]:items-start [&_button:first-child]:whitespace-normal [&_button:first-child]:text-left [&_small]:text-muted-foreground [&_p]:font-serif"
                    key={r.date}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate(r.date);
                        setPanel('');
                      }}
                    >
                      <small>
                        {r.date} · {r.poetry.author}
                      </small>
                      <p>{r.poetry.content}</p>
                    </Button>
                    <Button
                      variant="ghost"
                      aria-label="取消收藏"
                      onClick={() =>
                        setFavorites(favorites.filter((d) => d !== r.date))
                      }
                    >
                      <X />
                    </Button>
                  </div>
                ))}
              {favorites.length === 0 && (
                <p className="py-10 text-center leading-8 text-muted-foreground">
                  还没有收藏。把喜欢的诗，留给以后的自己。
                </p>
              )}
            </>
          )}
          {panel === '完整诗词' && (
            <article className="space-y-4 leading-8 [&_h2]:font-serif [&_h2]:text-2xl [&_h3]:pt-4 [&_h3]:font-medium">
              <h2>{day.poetry.title}</h2>
              <PoetryReader
                key={date}
                text={[
                  day.poetry.title,
                  day.poetry.author,
                  ...day.poetry.fullText,
                ].join('。')}
              />
              <p>
                {day.poetry.dynasty} · {day.poetry.author}
              </p>
              {day.poetry.fullText.map((line, i) => (
                <p className="font-serif text-lg" key={i}>
                  {line}
                </p>
              ))}
              <h3>译文</h3>
              <p>{day.poetry.translation}</p>
              {settings.analysis && (
                <>
                  <h3>赏析</h3>
                  <p>{day.poetry.appreciation}</p>
                </>
              )}
              <p>{day.poetry.tags.join(' · ')}</p>
              <Button
                variant="ghost"
                onClick={() => copy(day.poetry.fullText.join('\n'))}
              >
                复制完整诗词
              </Button>
              <Button variant="ghost" onClick={() => copy(day.poetry.content)}>
                复制诗句
              </Button>
            </article>
          )}
          {panel === '设置' && (
            <div className="space-y-6 py-3 [&>label]:flex [&>label]:items-center [&>label]:justify-between">
              {(
                [
                  'vertical',
                  'animation',
                  'date',
                  'lunar',
                  'analysis',
                  'traditional',
                ] as const
              ).map((key, i) => (
                <Label htmlFor={key} key={key}>
                  {
                    [
                      '竖排诗词',
                      '环境动画',
                      '显示日期',
                      '显示农历',
                      '显示赏析',
                      '繁体中文',
                    ][i]
                  }
                  <Switch
                    id={key}
                    checked={settings[key]}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, [key]: checked })
                    }
                  />
                </Label>
              ))}
              <div className="space-y-3">
                <Label htmlFor="mask">
                  背景柔化{' '}
                  <span className="ml-auto text-muted-foreground">
                    {settings.mask}%
                  </span>
                </Label>
                <Slider
                  id="mask"
                  aria-label="背景柔化"
                  min={0}
                  max={80}
                  value={[settings.mask]}
                  onValueChange={([mask]) => setSettings({ ...settings, mask })}
                />
                <p className="text-xs text-muted-foreground">
                  阅读区域独立保护对比度，不受背景柔化影响。
                </p>
              </div>
              <div className="space-y-3">
                <Label htmlFor="font-size">
                  诗词字号{' '}
                  <span className="ml-auto text-muted-foreground">
                    {settings.size}px
                  </span>
                </Label>
                <Slider
                  id="font-size"
                  aria-label="诗词字号"
                  min={28}
                  max={64}
                  value={[settings.size]}
                  onValueChange={([size]) => setSettings({ ...settings, size })}
                />
              </div>
            </div>
          )}
          {panel === '诗词海报' && (
            <>
              <Choice
                label="海报比例"
                value={ratio}
                onChange={setRatio}
                options={['9:16', '16:9', '1:1', '3:4'].map((r) => ({
                  value: r,
                  label: r,
                }))}
              />
              <div
                className="mx-auto my-5 max-w-full"
                style={{
                  width: `min(100%, calc(55svh * ${ratio.replace(':', ' / ')}))`,
                  containerType: 'inline-size',
                }}
              >
                <div
                  ref={poster}
                  className="flex w-full flex-col items-center justify-center bg-[#faf4e6] bg-cover bg-center text-center text-stone-900"
                  style={{
                    aspectRatio: ratio.replace(':', '/'),
                    backgroundImage: `linear-gradient(rgba(249,247,241,.12),rgba(249,247,241,.12)),url(${imageUrl(day.background.url, base)})`,
                    padding: '8cqw',
                    gap: '4cqw',
                  }}
                >
                  <p style={{ fontSize: '2.6cqw', lineHeight: 1.6 }}>
                    岁时有诗 · {date}
                  </p>
                  <h2
                    className="w-full font-serif"
                    style={{ fontSize: '4.4cqw', lineHeight: 1.9 }}
                  >
                    {day.poetry.content
                      .match(/[^，。！？；]+[，。！？；]?/g)
                      ?.map((line, i) => (
                        <span className="block" key={i}>
                          {line}
                        </span>
                      ))}
                  </h2>
                  <p style={{ fontSize: '2.6cqw', lineHeight: 1.6 }}>
                    {day.poetry.author} · {day.poetry.title}
                  </p>
                </div>
              </div>
              <Button className="w-full" onClick={download}>
                导出 PNG
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
