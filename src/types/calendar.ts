export interface CalendarDay {
  date: string;
  year: number;
  month: number;
  day: number;
  weekday: number;
  weekdayName: string;
  lunar: {
    year: string;
    month: number;
    day: number;
    monthName: string;
    dayName: string;
    zodiac: string;
    isLeapMonth: boolean;
  };
  season: '春' | '夏' | '秋' | '冬';
  solarTerm: string | null;
  festivals: string[];
  poetry: {
    content: string;
    title: string;
    author: string;
    dynasty: string;
    fullText: string[];
    translation: string;
    appreciation: string;
    tags: string[];
    sourceUrl: string;
    editorialStatus: string;
  };
  background: {
    url: string;
    mobileUrl: string | null;
    source: string;
    sourceUrl: string;
    author: string;
    license: string;
    style: string;
    description: string;
    keywords: string[];
    position: string;
    dominantColor: string;
    overlayOpacity: number;
    textColor: string;
    isFallback: boolean;
  };
}
