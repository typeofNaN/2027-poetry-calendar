import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
import { illustrationKey } from '../src/hooks/illustration';
import type { CalendarDay } from '../src/types/calendar';
const days = JSON.parse(
  readFileSync('src/data/calendar/2027.json', 'utf8'),
) as CalendarDay[];
const assets = JSON.parse(readFileSync('src/data/illustrations.json', 'utf8'));
assert.equal(Object.keys(assets).length, 46);
for (const day of days) {
  const key = illustrationKey(day);
  assert.equal(day.background.url, assets[key].url, day.date);
  assert(existsSync('public/' + assets[key].url));
}
for (const b of Object.values(assets) as { url: string }[]) {
  assert(/^[a-z0-9/.-]+$/.test(b.url), '图片文件名必须为 ASCII：' + b.url);
  assert(existsSync('public/' + b.url));
  assert(existsSync('public/' + b.url.replace('.webp', '-preview.webp')));
}
for (const name of ['dawn', 'spring', 'summer', 'autumn', 'winter'])
  assert(existsSync(`public/backgrounds/${name}.webp`));
console.log(
  '46 张生成插画、渐进预览、365 天优先级匹配与原有 5 张图片检查通过。',
);
