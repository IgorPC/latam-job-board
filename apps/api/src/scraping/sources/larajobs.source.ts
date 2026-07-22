import axios from 'axios';
import RSSParser from 'rss-parser';
import dayjs from 'dayjs';
import { ScrapingSource } from '../interfaces/scraping-context.interface';
import { RawJob } from '../interfaces/raw-job.interface';
import { HEADERS, DEFAULT_TIMEOUT_MS } from '../utils/http';
import { isRecent } from '../utils/filters';
import { sleep } from '../utils/rate-limiter';
import { extractJobPostingJsonLd } from '../utils/json-ld';
import { extractGenericPageText } from '../utils/generic-content';

const DEV_KW = [
  'developer', 'engineer', 'backend', 'fullstack', 'full-stack',
  'software', 'php', 'laravel', 'programmer', 'architect',
];

const MIN_GENERIC_DESC_LENGTH = 200;

// larajobs.com/job/{id} links are redirectors to the original posting (own
// career page, or a third-party ATS) — the feed's own content/contentSnippet
// fields are always empty, so the real description only exists downstream.
async function fetchDescription(url: string): Promise<string | null> {
  try {
    const { data: html } = await axios.get(url, { headers: HEADERS, timeout: DEFAULT_TIMEOUT_MS, maxRedirects: 5 });
    const jobPosting = extractJobPostingJsonLd(html);
    if (jobPosting?.description) return jobPosting.description;

    const generic = extractGenericPageText(html);
    return generic.length >= MIN_GENERIC_DESC_LENGTH ? generic : null;
  } catch {
    return null;
  }
}

export const laraJobsSource: ScrapingSource = {
  key: 'larajobs',
  label: 'LaraJobs',
  async run({ maxAgeDays }) {
    const parser = new RSSParser();
    const jobs: RawJob[] = [];

    const feed = await parser.parseURL('https://larajobs.com/feed');
    for (const entry of feed.items) {
      const title = entry.title ?? '';
      const combined = `${title} ${entry.contentSnippet ?? ''}`.toLowerCase();
      if (!DEV_KW.some((kw) => combined.includes(kw))) continue;

      const pubDate = entry.pubDate ? dayjs(entry.pubDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
      if (!isRecent(pubDate, maxAgeDays)) continue;

      const link = entry.link ?? '';
      await sleep(700);
      const richDesc = link ? await fetchDescription(link) : null;

      jobs.push({
        title,
        company: (entry as any).author ?? (entry as any)['dc:creator'] ?? '',
        url: link,
        date: pubDate,
        source: 'LaraJobs',
        _desc: richDesc ?? entry.contentSnippet ?? title,
        stack: 'Laravel',
        type: 'Remote',
        salary: '',
      });
    }

    return jobs;
  },
};
