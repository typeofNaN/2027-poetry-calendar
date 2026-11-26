import { describe, expect, it, vi } from 'vitest';
import { beijingDate, clampDate, shiftDate } from './calendar';
describe('2027 calendar boundaries', () => {
  it('clamps navigation at both year boundaries', () => {
    expect(shiftDate('2027-01-01', -1)).toBe('2027-01-01');
    expect(shiftDate('2027-12-31', 1)).toBe('2027-12-31');
  });
  it('crosses February correctly in a non-leap year', () => {
    expect(shiftDate('2027-02-28', 1)).toBe('2027-03-01');
  });
  it('clamps dates outside the supported year', () => {
    expect(clampDate('2026-11-25')).toBe('2027-01-01');
    expect(clampDate('2028-01-01')).toBe('2027-12-31');
  });
  it('uses Beijing midnight regardless of local timezone', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-05-19T16:00:00Z'));
    expect(beijingDate()).toBe('2027-05-20');
    vi.useRealTimers();
  });
});
