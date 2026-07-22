import * as cheerio from 'cheerio';

export interface JobPostingJsonLd {
  description?: string;
  countries?: string[];
}

// Many job boards/ATS platforms embed a schema.org JobPosting block via
// <script type="application/ld+json">, which is far more reliable than
// scraping presentation HTML: it gives a clean `description` and, when
// present, an `applicantLocationRequirements` allow-list of ISO country codes.
export function extractJobPostingJsonLd(html: string): JobPostingJsonLd | null {
  const $ = cheerio.load(html);

  for (const el of $('script[type="application/ld+json"]').toArray()) {
    let parsed: any;
    try {
      parsed = JSON.parse($(el).contents().text());
    } catch {
      continue;
    }

    const candidates = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.['@graph']) ? parsed['@graph'] : [parsed];
    const node = candidates.find((n: any) => n?.['@type'] === 'JobPosting');
    if (!node) continue;

    const countries = Array.isArray(node.applicantLocationRequirements)
      ? node.applicantLocationRequirements.map((c: any) => c?.name).filter((n: unknown): n is string => typeof n === 'string')
      : undefined;

    return {
      description: typeof node.description === 'string' ? node.description : undefined,
      countries,
    };
  }

  return null;
}
