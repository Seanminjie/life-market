declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
    getLunar(): Lunar;
    toYmd(): string;
  }

  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Lunar;
    getEightChar(): EightChar;
    getMonth(): number;
    getDay(): number;
  }

  export class EightChar {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYearNaYin(): string | null;
    getMonthNaYin(): string | null;
    getDayNaYin(): string | null;
    getTimeNaYin(): string | null;
    getYearShiShenGan(): string | null;
    getMonthShiShenGan(): string | null;
    getDayShiShenGan(): string | null;
    getTimeShiShenGan(): string | null;
    getYearShiShenZhi(): string | null;
    getMonthShiShenZhi(): string | null;
    getDayShiShenZhi(): string | null;
    getTimeShiShenZhi(): string | null;
    getYun(gender: number, sect?: number): Yun;
    setSect(sect: number): void;
  }

  export class Yun {
    getStartYear(): number;
    getStartMonth(): number;
    getStartDay(): number;
    getStartSolar(): Solar;
  }
}

