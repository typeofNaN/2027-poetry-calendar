const solarTerms: Record<string, string> = {
  小寒: 'xiaohan',
  大寒: 'dahan',
  立春: 'lichun',
  雨水: 'yushui',
  惊蛰: 'jingzhe',
  春分: 'chunfen',
  清明: 'qingming',
  谷雨: 'guyu',
  立夏: 'lixia',
  小满: 'xiaoman',
  芒种: 'mangzhong',
  夏至: 'xiazhi',
  小暑: 'xiaoshu',
  大暑: 'dashu',
  立秋: 'liqiu',
  处暑: 'chushu',
  白露: 'bailu',
  秋分: 'qiufen',
  寒露: 'hanlu',
  霜降: 'shuangjiang',
  立冬: 'lidong',
  小雪: 'xiaoxue',
  大雪: 'daxue',
  冬至: 'dongzhi',
};
const festivals: Record<string, string> = {
  元旦: 'new-year',
  腊八节: 'laba',
  除夕: 'eve',
  春节: 'spring-festival',
  元宵节: 'lantern',
  龙头节: 'dragon-head',
  端午节: 'dragon-boat',
  七夕节: 'qixi',
  中秋节: 'mid-autumn',
  重阳节: 'double-ninth',
};
export function illustrationKey(day: {
  month: number;
  festivals: string[];
  solarTerm: string | null;
}) {
  const festival = day.festivals.find((f) => festivals[f]);
  return festival
    ? `festival-${festivals[festival]}`
    : day.solarTerm
      ? `term-${solarTerms[day.solarTerm]}`
      : `month-${String(day.month).padStart(2, '0')}`;
}
