import RSSParser from 'rss-parser';
import dayjs from 'dayjs';
import { ScrapingSource } from '../interfaces/scraping-context.interface';
import { RawJob } from '../interfaces/raw-job.interface';
import { isRecent } from '../utils/filters';

const DEV_KW = [
  'developer', 'engineer', 'backend', 'fullstack', 'full-stack',
  'software', 'php', 'laravel', 'programmer', 'architect',
];

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

      jobs.push({
        title,
        company: (entry as any).author ?? (entry as any)['dc:creator'] ?? '',
        url: entry.link ?? '',
        date: pubDate,
        source: 'LaraJobs',
        _desc: entry.contentSnippet ?? '',
        stack: 'Laravel',
        type: 'Remote',
        salary: '',
      });
    }

    return jobs;
  },
};
