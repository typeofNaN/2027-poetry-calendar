import { test, expect } from 'vitest';
import { illustrationKey } from './illustration';
test('festival overrides solar term, which overrides month', () => {
  expect(
    illustrationKey({ month: 8, festivals: ['七夕节'], solarTerm: '立秋' }),
  ).toBe('festival-qixi');
  expect(illustrationKey({ month: 8, festivals: [], solarTerm: '立秋' })).toBe(
    'term-liqiu',
  );
  expect(illustrationKey({ month: 8, festivals: [], solarTerm: null })).toBe(
    'month-08',
  );
});
test('重阳覆盖寒露，清明复用节气图', () => {
  expect(
    illustrationKey({ month: 10, festivals: ['重阳节'], solarTerm: '寒露' }),
  ).toBe('festival-double-ninth');
  expect(
    illustrationKey({ month: 4, festivals: ['清明节'], solarTerm: '清明' }),
  ).toBe('term-qingming');
});
