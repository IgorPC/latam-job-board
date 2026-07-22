import axios from 'axios';
import { ScrapingSource } from '../interfaces/scraping-context.interface';
import { RawJob } from '../interfaces/raw-job.interface';
import { HEADERS, DEFAULT_TIMEOUT_MS } from '../utils/http';
import { isRelevant, isRecent } from '../utils/filters';
import { normalizeDate } from '../utils/date-parser';
import { extractSalary, formatSalaryRange } from '../utils/detectors';
import { sleep } from '../utils/rate-limiter';

const MAX_PAGES = 8;

export const himalayasSource: ScrapingSource = {
  key: 'himalayas',
  label: 'Himalayas',
  async run({ profile, maxAgeDays }) {
    const jobs: RawJob[] = [];
    let offset = 0;

    for (let page = 0; page < MAX_PAGES; page++) {
      let listings: any[] = [];
      try {
        const { data } = await axios.get('https://himalayas.app/jobs/api', {
          params: { offset },
          headers: HEADERS,
          timeout: DEFAULT_TIMEOUT_MS,
        });
        listings = data?.jobs ?? [];
      } catch {
        break;
      }

      if (!listings.length) break;

      for (const job of listings) {
        const title = job.title ?? '';
        const desc = job.description ?? '';
        if (!isRelevant(title, desc, profile)) continue;

        const pubDate = normalizeDate(job.publishedAt);
        if (!isRecent(pubDate, maxAgeDays)) continue;

        const salary =
          formatSalaryRange(job.salary?.currency ?? 'USD', job.salary?.min, job.salary?.max) || extractSalary(desc);

        jobs.push({
          title,
          company: job.company?.name ?? '',
          url: job.applicationUrl ?? job.company?.url ?? '',
          date: pubDate,
          source: 'Himalayas',
          _desc: desc,
          stack: '',
          type: job.isRemote ? 'Remote' : '',
          salary,
        });
      }

      offset += 20;
      await sleep(1000);
    }

    return jobs;
  },
};
