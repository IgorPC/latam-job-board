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
  'south america', 'international candidates',
  'remote worldwide', 'open to all', 'any country', 'any location',
];

const NEGATIVE_LATAM_KW = [
  'us only', 'uk only', 'eu only', 'europe only', 'must be based in',
  'must reside in', 'must live in', 'must be located', 'candidates must be in',
  'authorized to work in', 'eligible to work in', 'work authorization required',
  'north america only', 'united states only', 'based in the us', 'based in the uk',
  'based in europe', 'us-based', 'uk-based', 'eu-based', 'us citizens only',
  'us residents only', 'not available in latam', 'excluding latam',
  'only open to', 'only available to', 'only accepting candidates from',
  'restricted to candidates in', 'this position is only available in',
  'candidates outside of', 'will not be considered', 'applicants must be located in',
  'must currently reside in', 'only for residents of', 'open only to residents of',
  'this role is only open to', 'only candidates based in', 'is only available from',
];

// A structured allow-list, e.g. from a JobPosting JSON-LD
// applicantLocationRequirements block (see json-ld.ts), enriched into the
// description as "Eligible countries only: X, Y, Z." — this is ground truth,
// not a keyword guess, so it takes priority over both keyword lists below.
const ELIGIBLE_COUNTRIES_RE = /eligible countries only:\s*([^.]+)\./i;

// `country` is the user-configured LATAM country (e.g. "Brazil", "Argentina")
// — kept dynamic so the board isn't hardcoded to Brazil for other LATAM users.
// Negative phrasing is checked first: "not available in brazil" must not be
// short-circuited by the generic positive "brazil" substring match.
export function acceptsLatam(title: string, desc: string, type: string, country: string): 'Yes' | 'No' | 'Maybe' {
  if (type.toLowerCase().includes('relocation')) return 'Yes';

  const text = `${title} ${desc}`.toLowerCase();
  const countryKw = country.toLowerCase();

  const allowListMatch = text.match(ELIGIBLE_COUNTRIES_RE);
  if (allowListMatch && countryKw) {
    return allowListMatch[1].includes(countryKw) ? 'Yes' : 'No';
  }

  if (NEGATIVE_LATAM_KW.some((kw) => text.includes(kw))) return 'No';
  if (countryKw && (text.includes(`not available in ${countryKw}`) || text.includes(`excluding ${countryKw}`))) return 'No';
  if (POSITIVE_LATAM_KW.some((kw) => text.includes(kw))) return 'Yes';
  if (countryKw && text.includes(countryKw)) return 'Yes';
  return 'Maybe';
}
