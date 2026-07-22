import axios from 'axios';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { ScrapingSource } from '../interfaces/scraping-context.interface';
import { RawJob } from '../interfaces/raw-job.interface';
import { HEADERS, DEFAULT_TIMEOUT_MS } from '../utils/http';
import { isRelevant, isRecent } from '../utils/filters';
import { sleep } from '../utils/rate-limiter';
import { extractJobPostingJsonLd } from '../utils/json-ld';
import { isoToCountryName } from '../utils/iso-countries';

const CATEGORIES = ['back-end-development', 'it-development'];
const IGNORED_LINK_TEXT = ['view job', 'apply', 'see job'];
const MAX_PAGES = 3;

// Jobgether embeds a schema.org JobPosting <script type="application/ld+json">
// on each /offer/ detail page with the full HTML description and, when the
// role is restricted, an authoritative applicantLocationRequirements list —
// far richer and more reliable than the listing-page card text.
async function fetchDescription(url: string): Promise<string | null> {
  try {
    const { data: html } = await axios.get(url, { headers: HEADERS, timeout: DEFAULT_TIMEOUT_MS });
    const jobPosting = extractJobPostingJsonLd(html);
    if (!jobPosting?.description) return null;

    let desc = jobPosting.description;
    if (jobPosting.countries?.length) {
      desc += ` Eligible countries only: ${jobPosting.countries.map(isoToCountryName).join(', ')}.`;
    }
    return desc;
  } catch {
    return null;
  }
}

export const jobgetherSource: ScrapingSource = {
  key: 'jobgether',
  label: 'Jobgether',
  async run({ profile, maxAgeDays }) {
    const jobs: RawJob[] = [];
    const seen = new Set<string>();
    const today = dayjs().format('YYYY-MM-DD');

    for (const category of CATEGORIES) {
      for (let page = 1; page <= MAX_PAGES; page++) {
        let html = '';
        try {
          const res = await axios.get(`https://jobgether.com/remote-jobs/${category}`, {
            params: page > 1 ? { page } : {},
            headers: HEADERS,
            timeout: DEFAULT_TIMEOUT_MS,
          });
          html = res.data;
        } catch {
          break;
        }

        const $ = cheerio.load(html);
        const offerLinks = $('a[href^="/offer/"]').toArray();
        if (!offerLinks.length) break;

        for (const el of offerLinks) {
          const href = 'https://jobgether.com' + $(el).attr('href');
          const title = $(el).text().trim();
          if (!title || IGNORED_LINK_TEXT.includes(title.toLowerCase())) continue;
          if (seen.has(href)) continue;
          seen.add(href);

          const listingContext = $(el).closest('article, li, div').text().replace(/\s+/g, ' ').trim();
          if (!isRelevant(title, listingContext, profile)) continue;
          if (!isRecent(today, maxAgeDays)) continue;

          await sleep(700);
          const richDesc = await fetchDescription(href);

          jobs.push({
            title,
            company: '',
            url: href,
            date: today,
            source: 'Jobgether',
            _desc: richDesc ?? listingContext,
            stack: '',
            type: 'Remote',
            salary: '',
          });
        }

        await sleep(2000);
      }
    }

    return jobs;
  },
};
