import axios from 'axios';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { ScrapingSource } from '../interfaces/scraping-context.interface';
import { RawJob } from '../interfaces/raw-job.interface';
import { HEADERS, DEFAULT_TIMEOUT_MS } from '../utils/http';
import { sleep } from '../utils/rate-limiter';
import { extractJobPostingJsonLd } from '../utils/json-ld';
import { isoToCountryName } from '../utils/iso-countries';

// Strider's job detail pages embed a schema.org JobPosting JSON-LD block
// with the full description and an applicantLocationRequirements allow-list.
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

export const striderSource: ScrapingSource = {
  key: 'strider',
  label: 'Strider',
  async run() {
    const jobs: RawJob[] = [];
    const seen = new Set<string>();
    const today = dayjs().format('YYYY-MM-DD');

    const { data: html } = await axios.get('https://www.onstrider.com/jobs', {
      headers: HEADERS,
      timeout: DEFAULT_TIMEOUT_MS,
    });
    const $ = cheerio.load(html);

    const links = $('a[href^="/jobs/"]')
      .toArray()
      .filter((el) => /^\/jobs\/[a-z0-9-]+-[a-f0-9]+$/.test($(el).attr('href') ?? ''));

    for (const el of links) {
      const slug = $(el).attr('href') ?? '';
      const url = `https://www.onstrider.com${slug}`;
      if (seen.has(url)) continue;
      seen.add(url);

      const $card = $(el).closest('li').first();
      const title = $card.find('h2').text().trim();
      if (!title) continue;

      const skills = $card
        .find('li:not(:has(a))')
        .map((_, t) => $(t).text().trim())
        .get()
        .filter((t) => t.length > 1 && !t.includes('Remote') && !t.includes('Company'));

      await sleep(700);
      const richDesc = await fetchDescription(url);

      jobs.push({
        title,
        company: 'US Company via Strider',
        url,
        date: today,
        source: 'Strider',
        _desc: richDesc ?? [title, ...skills].join(' '),
        stack: '',
        type: 'Remote',
        salary: '',
      });
    }

    return jobs;
  },
};
