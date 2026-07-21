import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapingSource } from '../interfaces/scraping-context.interface';
import { RawJob } from '../interfaces/raw-job.interface';
import { HEADERS, DEFAULT_TIMEOUT_MS } from '../utils/http';
import { normalizeDate } from '../utils/date-parser';
import { sleep } from '../utils/rate-limiter';

const CATEGORIES = ['development', 'back-end'];

export const workingNomadsSource: ScrapingSource = {
  key: 'workingnomads',
  label: 'Working Nomads',
  async run() {
    const jobs: RawJob[] = [];

    for (const category of CATEGORIES) {
      try {
        const { data } = await axios.get('https://www.workingnomads.com/api/exposed_jobs/', {
          params: { category },
          headers: HEADERS,
          timeout: DEFAULT_TIMEOUT_MS,
        });

        const listings = Array.isArray(data) ? data : (data?.results ?? []);
        for (const job of listings) {
          const descText = job.description ? cheerio.load(job.description).text() : '';
          jobs.push({
            title: job.title,
            company: job.company_name ?? '',
            url: job.url,
            date: normalizeDate(job.pub_date),
            source: 'Working Nomads',
            _desc: descText,
            stack: '',
            type: '',
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
