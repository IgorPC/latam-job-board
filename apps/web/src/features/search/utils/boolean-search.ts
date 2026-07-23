export interface BooleanLink {
  label: string;
  url: string;
  hint: string;
}

const LATAM_CLAUSE = 'Remote OR Latam OR "Latin America" OR Brazil';

function buildQuery(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function toStackQuery(stack: string[]): string {
  return stack.map((s) => (s.includes(' ') ? `"${s}"` : s)).join(' OR ');
}

export function generateBooleanLinks(stack: string[]): BooleanLink[] {
  if (stack.length === 0) return [];

  const stackQuery = toStackQuery(stack);

  return [
    {
      label: 'Lever (ATS)',
      url: buildQuery(`site:lever.co (${stackQuery}) AND (${LATAM_CLAUSE})`),
      hint: 'Startups on Lever rarely show up in aggregators',
    },
    {
      label: 'Greenhouse (ATS)',
      url: buildQuery(`site:boards.greenhouse.io (${stackQuery}) AND (${LATAM_CLAUSE})`),
      hint: 'Companies like Stripe, Notion, Linear',
    },
    {
      label: 'Ashby (ATS)',
      url: buildQuery(`site:jobs.ashbyhq.com (${stackQuery}) AND (${LATAM_CLAUSE})`),
      hint: 'Modern ATS adopted by well-funded startups',
    },
    {
      label: 'Loxo (agencies)',
      url: buildQuery(`site:loxo.co (${stackQuery}) AND (${LATAM_CLAUSE})`),
      hint: 'Tech recruiting agencies, e.g. FitNext',
    },
    {
      label: 'LinkedIn Jobs',
      url: buildQuery(`site:linkedin.com/jobs (${stackQuery}) AND (Remote) AND (Brazil OR Latam OR "Latin America")`),
      hint: 'Formal listings on LinkedIn',
    },
    {
      label: 'Wellfound',
      url: buildQuery(`site:wellfound.com (${stackQuery}) AND (Remote OR "Latin America" OR Brazil)`),
      hint: 'Remote-first startups, above-average pay',
    },
    {
      label: 'Indeed',
      url: buildQuery(`site:indeed.com (${stackQuery}) AND (${LATAM_CLAUSE})`),
      hint: 'Broad coverage, companies that only post here',
    },
    {
      label: 'Glassdoor',
      url: buildQuery(`site:glassdoor.com (${stackQuery}) AND (${LATAM_CLAUSE})`),
      hint: 'Roles with documented salary data',
    },
  ];
}
