import { illustrationKey } from '../src/hooks/illustration';
import { readFileSync, writeFileSync } from 'node:fs';
import { Solar } from 'lunar-typescript';
import * as OpenCC from 'opencc-js';
const convert = OpenCC.Converter({ from: 'tw', to: 'cn' });
const source =
  'https://github.com/chinese-poetry/chinese-poetry/blob/master/全唐诗/唐诗三百首.json';
const poems = JSON.parse(
  convert(readFileSync('src/data/sources/tang-poems.json', 'utf8')),
) as { title: string; author: string; paragraphs: string[]; tags: string[] }[];
const specials = [
  {
    title: '元日',
    author: '王安石',
    dynasty: '宋',
    paragraphs: [
      '爆竹声中一岁除，春风送暖入屠苏。',
      '千门万户曈曈日，总把新桃换旧符。',
    ],
    tags: ['春节', '新年'],
    translation:
      '爆竹声送走旧岁，和暖春风伴着屠苏酒迎来新年。千家万户沐浴朝阳，换上新桃符。',
    appreciation: '以爆竹、春风和桃符串起新年民俗，写出辞旧迎新的明朗生机。',
  },
  {
    title: '清明',
    author: '杜牧',
    dynasty: '唐',
    paragraphs: [
      '清明时节雨纷纷，路上行人欲断魂。',
      '借问酒家何处有？牧童遥指杏花村。',
    ],
    tags: ['清明', '春雨'],
    translation:
      '清明细雨纷纷，行人愁思满怀。问哪里有酒家，牧童指向远处的杏花村。',
    appreciation:
      '细雨与行人的心绪相融，结尾以牧童遥指的动作展开明亮而悠远的画面。',
  },
  {
    title: '鹊桥仙·纤云弄巧',
    author: '秦观',
    dynasty: '宋',
    paragraphs: [
      '纤云弄巧，飞星传恨，银汉迢迢暗度。',
      '金风玉露一相逢，便胜却人间无数。',
      '柔情似水，佳期如梦，忍顾鹊桥归路。',
      '两情若是久长时，又岂在朝朝暮暮。',
    ],
    tags: ['七夕', '相思'],
    translation:
      '轻云变幻，流星传情，牛郎织女渡过银河相会。秋风白露中的一次相逢胜过无数相聚；若情意长久，何必拘泥于朝夕相守。',
    appreciation: '借牛郎织女的故事，将短暂相聚升华为长久忠贞的爱情。',
  },
  {
    title: '水调歌头·明月几时有',
    author: '苏轼',
    dynasty: '宋',
    paragraphs: [
      '明月几时有？把酒问青天。',
      '不知天上宫阙，今夕是何年。',
      '我欲乘风归去，又恐琼楼玉宇，高处不胜寒。',
      '起舞弄清影，何似在人间。',
      '转朱阁，低绮户，照无眠。',
      '不应有恨，何事长向别时圆？',
      '人有悲欢离合，月有阴晴圆缺，此事古难全。',
      '但愿人长久，千里共婵娟。',
    ],
    tags: ['中秋', '团圆'],
    translation:
      '举酒向天询问明月的来历，思绪从月宫回到人间。人生离合如月亮圆缺，自古难全；只愿亲人平安，虽隔千里仍能共赏月色。',
    appreciation:
      '从问月到祝愿，词人将离别的惆怅化为旷达，赋予中秋月色温柔的人间情意。',
  },
];
const candidates = poems.flatMap((p) =>
  p.paragraphs
    .filter(
      (s) => s.length >= 10 && s.length <= 38 && !/[战杀血死鬼怨]/.test(s),
    )
    .map((content) => ({ ...p, content })),
);
const specialQuotes: Record<string, string> = {
  春节: '爆竹声中一岁除，春风送暖入屠苏。',
  七夕节: '两情若是久长时，又岂在朝朝暮暮。',
  中秋节: '但愿人长久，千里共婵娟。',
};
const used = new Set<string>();
const keys = {
  春: '春花柳雨燕莺芳草桃杏',
  夏: '夏荷莲竹清风池绿凉',
  秋: '秋月桂菊露枫雁霜',
  冬: '冬雪梅寒岁炉冰',
};
let season: keyof typeof keys = '冬';
const result = Array.from({ length: 365 }, (_, index) => {
  const date = new Date(Date.UTC(2027, 0, index + 1));
  const month = date.getUTCMonth() + 1,
    day = date.getUTCDate();
  const lunar = Solar.fromYmd(2027, month, day).getLunar();
  const solarTerm = lunar.getJieQi() || null;
  if (solarTerm === '立春') season = '春';
  if (solarTerm === '立夏') season = '夏';
  if (solarTerm === '立秋') season = '秋';
  if (solarTerm === '立冬') season = '冬';
  const festivals = lunar.getFestivals();
  if (index === 0) festivals.push('元旦');
  const preferred =
    index === 0
      ? '海日生残夜，江春入旧年。'
      : solarTerm === '雨水'
        ? '好雨知时节，当春乃发生。'
        : festivals.includes('重阳节')
          ? '遥知兄弟登高处，遍插茱萸少一人。'
          : '';
  const scores = candidates
    .filter((p) => !used.has(p.content))
    .map((p) => ({
      p,
      score:
        [...keys[season]].reduce(
          (s, k) => s + (p.content.includes(k) ? 3 : 0),
          0,
        ) +
        (p.content === preferred ? 1000 : 0) -
        (p.tags?.some((t) => /战争|讽刺|伤怀/.test(t)) ? 8 : 0),
    }))
    .sort((a, b) => b.score - a.score);
  const target =
    solarTerm === '清明'
      ? '清明时节雨纷纷，路上行人欲断魂。'
      : festivals.map((f) => specialQuotes[f]).find(Boolean);
  const special = specials.find((p) => p.paragraphs.includes(target || ''));
  const p = special ? { ...special, content: target! } : scores[0].p;
  used.add(p.content);
  const name = { 春: 'spring', 夏: 'summer', 秋: 'autumn', 冬: 'winter' }[
    season
  ];
  return {
    date: date.toISOString().slice(0, 10),
    year: 2027,
    month,
    day,
    weekday: date.getUTCDay(),
    weekdayName: '星期' + '日一二三四五六'[date.getUTCDay()],
    lunar: {
      year: lunar.getYearInGanZhi() + '年',
      month: Math.abs(lunar.getMonth()),
      day: lunar.getDay(),
      monthName: lunar.getMonthInChinese() + '月',
      dayName: lunar.getDayInChinese(),
      zodiac: lunar.getYearShengXiao(),
      isLeapMonth: lunar.getMonth() < 0,
    },
    season,
    solarTerm,
    festivals,
    poetry: {
      content: p.content,
      title: p.title,
      author: p.author,
      dynasty: special?.dynasty || '唐',
      fullText: p.paragraphs,
      translation: special?.translation || '白话译文待编校。',
      appreciation:
        special?.appreciation ||
        '本篇原文收录于《唐诗三百首》公开诗词库，赏析待编校。',
      tags: [season, ...(p.tags || []).slice(0, 3)],
      sourceUrl: special
        ? 'https://zh.wikisource.org/wiki/' +
          encodeURIComponent(special.title.split('·')[0])
        : source,
      editorialStatus: '原文有来源；选句季节匹配及译注待人工复核',
    },
    background: {
      url: `backgrounds/${index === 0 ? 'dawn' : name}.webp`,
      mobileUrl: null,
      source: 'AI 生成的四季共用降级插画',
      sourceUrl: 'docs/ASSETS.md',
      author: 'OpenAI ImageGen',
      license: '项目生成素材（非第三方授权）',
      style: '东方水墨插画',
      description: season + '季山水意境；尚非逐首精确配图',
      keywords: [season, '山水'],
      position: 'center center',
      dominantColor: '#d6c9ae',
      overlayOpacity: 0.15,
      textColor: '#263c39',
      isFallback: index !== 0,
    },
  };
});
const illustrations = JSON.parse(
  readFileSync('src/data/illustrations.json', 'utf8'),
);
for (const day of result) {
  day.background = {
    ...day.background,
    ...illustrations[illustrationKey(day)],
    source: 'generated',
    isFallback: false,
  };
}
writeFileSync(
  'src/data/calendar/2027.json',
  JSON.stringify(result, null, 2) + '\n',
);
