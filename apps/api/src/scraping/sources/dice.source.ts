import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapingSource } from '../interfaces/scraping-context.interface';
import { RawJob } from '../interfaces/raw-job.interface';
import { HEADERS, DEFAULT_TIMEOUT_MS } from '../utils/http';
import { sleep } from '../utils/rate-limiter';

export const diceSource: ScrapingSource = {
  key: 'dice',
  label: 'Dice',
  async run({ profile }) {
    const jobs: RawJob[] = [];

    for (const query of profile.primaryStack) {
      try {
        const { data: html } = await axios.get('https://www.dice.com/jobs', {
          params: { q: query, l: 'Remote', countryCode: 'US', 'filters.postedDate': 'THREE' },
          headers: HEADERS,
          timeout: DEFAULT_TIMEOUT_MS,
        });

        const $ = cheerio.load(html);
        const scriptTag = $('script#__NEXT_DATA__').text();
        let listings: any[] = [];

        if (scriptTag) {
          try {
            const data = JSON.parse(scriptTag);
            listings = data?.props?.pageProps?.initialState?.jobs?.items ?? [];
          } catch {
            listings = [];
          }
        }

        if (listings.length) {
          for (const job of listings) {
            jobs.push({
              title: job.title ?? '',
              company: job.companyName ?? '',
              url: `https://www.dice.com/job-detail/${job.id}`,
              date: (job.postedDate ?? '').slice(0, 10),
              source: 'Dice',
              _desc: job.descriptionFragment ?? job.summary ?? '',
              stack: '',
              type: 'Remote',
              salary: '',
            });
          }
        }
      } catch {
      }
      await sleep(2000);
    }

    return jobs;
  },
};
