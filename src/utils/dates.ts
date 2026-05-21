import dayjs from 'dayjs';

export function todayStr(): string {
  return dayjs().format('YYYY-MM-DD');
}

export function dateStr(d: dayjs.Dayjs | Date | string): string {
  return dayjs(d).format('YYYY-MM-DD');
}

/** Whole-day difference: dateStr(b) - dateStr(a). Positive if b is after a. */
export function daysBetween(a: string, b: string): number {
  return dayjs(b).startOf('day').diff(dayjs(a).startOf('day'), 'day');
}

export function yesterdayOf(d: string): string {
  return dayjs(d).subtract(1, 'day').format('YYYY-MM-DD');
}

export function isSameDay(a: string, b: string): boolean {
  return dayjs(a).isSame(dayjs(b), 'day');
}
