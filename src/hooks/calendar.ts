export const START = '2027-01-01';
export const END = '2027-12-31';
export const beijingDate = () =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(
    new Date(),
  );
export const clampDate = (date: string) =>
  date < START ? START : date > END ? END : date;
export const shiftDate = (date: string, delta: number) =>
  clampDate(
    new Date(Date.parse(date + 'T12:00:00Z') + delta * 86400000)
      .toISOString()
      .slice(0, 10),
  );
