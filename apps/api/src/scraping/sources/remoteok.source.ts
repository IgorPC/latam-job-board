import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapingSource } from '../interfaces/scraping-context.interface';
import { RawJob } from '../interfaces/raw-job.interface';
import { HEADERS, DEFAULT_TIMEOUT_MS } from '../utils/http';
import { normalizeDate } from '../utils/date-parser';
import { sleep } from '../utils/rate-limiter';

export const remoteOkSource: ScrapingSource = {
  key: 'remoteok',
  label: 'Remote OK',
  async run({ profile }) {
    const jobs: RawJob[] = [];
    const tags = profile.primaryStack.length ? profile.primaryStack : [];

    for (const tag of tags) {
      try {
        const { data } = await axios.get('https://remoteok.com/api', {
          params: { tags: tag },
          headers: HEADERS,
          timeout: DEFAULT_TIMEOUT_MS,
        });

        const listings = Array.isArray(data) ? data.filter((j: any) => j?.position) : [];
        for (const job of listings) {
          const descText = job.description ? cheerio.load(job.description).text() : '';
          const salary =
            job.salary_min && job.salary_max ? `USD ${job.salary_min.toLocaleString()}–${job.salary_max.toLocaleString()}` : '';

          jobs.push({
            title: job.position,
            company: job.company ?? '',
            url: job.url ?? `https://remoteok.com/remote-jobs/${job.id}`,
            date: normalizeDate(job.date),
            source: 'Remote OK',
            _desc: descText,
            stack: '',
            type: '',
            salary,
          });
        }
      } catch {
      }
      await sleep(1200);
    }

    return jobs;
  },
};
