import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
import { Solar } from 'lunar-typescript';
import type { CalendarDay } from '../src/types/calendar';
const days = JSON.parse(
  readFileSync('src/data/calendar/2027.json', 'utf8'),
) as CalendarDay[];
assert.equal(days.length, 365);
const dates = new Set<string>(),
  quotes = new Set<string>(),
  terms = new Set<string>();
for (const [i, d] of days.entries()) {
  assert.equal(
    d.date,
    new Date(Date.UTC(2027, 0, i + 1)).toISOString().slice(0, 10),
  );
  assert(!dates.has(d.date));
  dates.add(d.date);
  assert(d.poetry.content && !quotes.has(d.poetry.content));
  quotes.add(d.poetry.content);
  assert(d.poetry.fullText.includes(d.poetry.content));
  assert(
    d.poetry.author && d.poetry.title && d.poetry.dynasty && d.poetry.sourceUrl,
  );
  const l = Solar.fromYmd(d.year, d.month, d.day).getLunar();
  assert.equal(d.lunar.day, l.getDay());
  assert.equal(d.lunar.month, Math.abs(l.getMonth()));
  assert.equal(d.lunar.isLeapMonth, l.getMonth() < 0);
  assert.equal(d.solarTerm, l.getJieQi() || null);
  for (const f of l.getFestivals()) assert(d.festivals.includes(f));
  if (d.solarTerm) terms.add(d.solarTerm);
  assert(
    /^https:\/\//.test(d.background.url) ||
      existsSync('public/' + d.background.url),
    d.background.url,
  );
  assert(d.background.author && d.background.license && d.background.source);
}
assert.equal(terms.size, 24);
console.log(
  '365 连续日期、唯一摘句、原文对应、农历、24 节气、节日和背景地址检查通过。译注与逐日选诗仍待人工编校。',
);
