import RSSParser from 'rss-parser';
import dayjs from 'dayjs';
import { ScrapingSource } from '../interfaces/scraping-context.interface';
import { RawJob } from '../interfaces/raw-job.interface';
import { isRelevant, isRecent } from '../utils/filters';

export const jsRemotelySource: ScrapingSource = {
  key: 'jsremotely',
  label: 'JS Remotely',
  async run({ profile, maxAgeDays }) {
    const parser = new RSSParser();
    const jobs: RawJob[] = [];

    const feed = await parser.parseURL('https://jsremotely.com/feed');
    for (const entry of feed.items) {
      const title = entry.title ?? '';
      const desc = entry.contentSnippet ?? entry.content ?? '';
      if (!isRelevant(title, desc, profile)) continue;

      const pubDate = entry.pubDate ? dayjs(entry.pubDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
      if (!isRecent(pubDate, maxAgeDays)) continue;

      jobs.push({
        title,
        company: (entry as any)['dc:creator'] ?? '',
        url: entry.link ?? '',
        date: pubDate,
        source: 'JS Remotely',
        _desc: desc,
        stack: '',
        type: 'Remote',
        salary: '',
      });
    }

    return jobs;
  },
};
