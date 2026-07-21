import RSSParser from 'rss-parser';
import dayjs from 'dayjs';
import { ScrapingSource } from '../interfaces/scraping-context.interface';
import { RawJob } from '../interfaces/raw-job.interface';
import { isRelevant, isRecent } from '../utils/filters';
import { sleep } from '../utils/rate-limiter';

const FEEDS = [
  'https://weworkremotely.com/categories/remote-back-end-programming-jobs.rss',
  'https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss',
];

export const weWorkRemotelySource: ScrapingSource = {
  key: 'weworkremotely',
  label: 'We Work Remotely',
  async run({ profile, maxAgeDays }) {
    const parser = new RSSParser();
    const jobs: RawJob[] = [];

    for (const feedUrl of FEEDS) {
      try {
        const feed = await parser.parseURL(feedUrl);
        for (const entry of feed.items) {
          const rawTitle = entry.title ?? '';
          const [company, title] = rawTitle.includes(': ') ? rawTitle.split(': ', 2) : ['', rawTitle];
          const desc = entry.contentSnippet ?? entry.content ?? '';

          if (!isRelevant(title, desc, profile)) continue;

          const pubDate = entry.pubDate ? dayjs(entry.pubDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
          if (!isRecent(pubDate, maxAgeDays)) continue;

          jobs.push({
            title,
            company,
            url: entry.link ?? '',
            date: pubDate,
            source: 'We Work Remotely',
            _desc: desc,
            stack: '',
            type: 'Remote',
            salary: '',
          });
        }
      } catch {
      }
      await sleep(800);
    }

    return jobs;
  },
};
