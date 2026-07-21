import axios from 'axios';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { ScrapingSource } from '../interfaces/scraping-context.interface';
import { RawJob } from '../interfaces/raw-job.interface';
import { HEADERS, DEFAULT_TIMEOUT_MS } from '../utils/http';
import { sleep } from '../utils/rate-limiter';

export const dynamiteJobsSource: ScrapingSource = {
  key: 'dynamitejobs',
  label: 'Dynamite Jobs',
  async run({ profile }) {
    const jobs: RawJob[] = [];
    const queries = [...profile.primaryStack, ...profile.secondaryStack];
    const today = dayjs().format('YYYY-MM-DD');

    for (const query of queries) {
      try {
        const { data: html } = await axios.get('https://dynamitejobs.com/remote-jobs', {
          params: { search: query },
          headers: HEADERS,
          timeout: DEFAULT_TIMEOUT_MS,
        });

        const $ = cheerio.load(html);
        const cards = $('article, div.job, div.card').toArray().slice(0, 30);

        for (const card of cards) {
          const a = $(card).find('a[href]').first();
          let href = a.attr('href') ?? '';
          if (!href) continue;
          if (!href.startsWith('http')) href = 'https://dynamitejobs.com' + href;

          const title = $(card).find('h2, h3').first().text().trim() || a.text().trim();
          if (!title) continue;
          const text = $(card).text().replace(/\s+/g, ' ').trim();

          jobs.push({
            title,
            company: '',
            url: href,
            date: today,
            source: 'Dynamite Jobs',
            _desc: text,
            stack: '',
            type: 'Remote',
            salary: '',
          });
        }
      } catch {
      }
      await sleep(2000);
    }

    return jobs;
  },
};
