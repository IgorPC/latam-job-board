import dayjs from 'dayjs';

export function parseRelativeDate(text: string): string {
  const t = text.toLowerCase();
  const today = dayjs();
  const match = t.match(/(\d+)\s+(day|week|month|hour|minute)/);
  if (!match) return today.format('YYYY-MM-DD');

  const amount = parseInt(match[1], 10);
  const unitMap: Record<string, dayjs.ManipulateType> = {
    day: 'day',
    week: 'week',
    month: 'month',
    hour: 'hour',
    minute: 'minute',
  };
  const unit = unitMap[match[2]];
  return today.subtract(amount, unit).format('YYYY-MM-DD');
}

export function normalizeDate(raw: string | number | undefined | null): string {
  if (!raw) return dayjs().format('YYYY-MM-DD');
  if (typeof raw === 'number') return dayjs(raw).format('YYYY-MM-DD');
  const parsed = dayjs(raw);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : raw.slice(0, 10);
}
