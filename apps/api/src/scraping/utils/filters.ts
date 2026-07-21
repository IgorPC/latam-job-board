import dayjs from 'dayjs';
import { ScrapingProfile } from '../interfaces/scraping-context.interface';

export function isRelevant(title: string, description: string, profile: ScrapingProfile): boolean {
  const text = `${title} ${description}`.toLowerCase();
  if (profile.primaryStack.some((kw) => text.includes(kw.toLowerCase()))) return true;
  if (profile.secondaryStack.some((kw) => text.includes(kw.toLowerCase()))) return true;
  return false;
}

export function isRecent(pubDate: string, maxAgeDays: number): boolean {
  const jobDate = dayjs(pubDate, 'YYYY-MM-DD');
  if (!jobDate.isValid()) return true;

  const today = dayjs().startOf('day');
  if (jobDate.isSame(today, 'day')) return true;
  return today.diff(jobDate, 'day') <= maxAgeDays;
}

const POSITIVE_LATAM_KW = [
  'worldwide', 'anywhere', 'work from anywhere', 'global remote', 'globally',
  'all countries', 'no location restriction', 'latam', 'latin america',
  'south america', 'brazil', 'brasil', 'international candidates',
  'remote worldwide', 'open to all', 'any country', 'any location',
];

const NEGATIVE_LATAM_KW = [
  'us only', 'uk only', 'eu only', 'europe only', 'must be based in',
  'must reside in', 'must live in', 'must be located', 'candidates must be in',
  'authorized to work in', 'eligible to work in', 'work authorization required',
  'north america only', 'united states only', 'based in the us', 'based in the uk',
  'based in europe', 'us-based', 'uk-based', 'eu-based', 'us citizens only',
  'us residents only', 'not available in brazil', 'not available in latam',
  'excluding latam', 'excluding brazil',
];

export function acceptsLatam(title: string, desc: string, type: string): 'Yes' | 'No' | 'Maybe' {
  if (type.toLowerCase().includes('relocation')) return 'Yes';

  const text = `${title} ${desc}`.toLowerCase();
  if (POSITIVE_LATAM_KW.some((kw) => text.includes(kw))) return 'Yes';
  if (NEGATIVE_LATAM_KW.some((kw) => text.includes(kw))) return 'No';
  return 'Maybe';
}
