import axios from 'axios';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { ScrapingSource } from '../interfaces/scraping-context.interface';
import { RawJob } from '../interfaces/raw-job.interface';
import { HEADERS, DEFAULT_TIMEOUT_MS } from '../utils/http';
import { sleep } from '../utils/rate-limiter';

export const arbeitnowSource: ScrapingSource = {
  key: 'arbeitnow',
  label: 'Arbeitnow',
  async run({ profile }) {
    const jobs: RawJob[] = [];
    const queries = [...profile.primaryStack, ...profile.secondaryStack.map((s) => `${s} backend`)];

    for (const query of queries) {
      try {
        const { data } = await axios.get('https://www.arbeitnow.com/api/job-board-api', {
          params: { search: query },
          headers: HEADERS,
          timeout: DEFAULT_TIMEOUT_MS,
        });

        for (const job of data?.data ?? []) {
          const descText = job.description ? cheerio.load(job.description).text() : '';
          jobs.push({
            title: job.title,
            company: job.company_name ?? '',
            url: job.url,
            date: dayjs.unix(job.created_at).format('YYYY-MM-DD'),
            source: 'Arbeitnow',
            _desc: descText,
            stack: '',
            type: job.remote ? 'Remote' : '',
            salary: '',
          });
        }
      } catch {
      }
      await sleep(1000);
    }

    return jobs;
  },
};
