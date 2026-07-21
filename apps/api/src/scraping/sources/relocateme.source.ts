import axios from 'axios';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { ScrapingSource } from '../interfaces/scraping-context.interface';
import { RawJob } from '../interfaces/raw-job.interface';
import { HEADERS, DEFAULT_TIMEOUT_MS } from '../utils/http';
import { sleep } from '../utils/rate-limiter';

export const relocateMeSource: ScrapingSource = {
  key: 'relocateme',
  label: 'Relocate.me',
  async run({ profile }) {
    const jobs: RawJob[] = [];
    const queries = [...profile.primaryStack, ...profile.secondaryStack];
    const today = dayjs().format('YYYY-MM-DD');

    for (const query of queries) {
      try {
        const { data: html } = await axios.get('https://relocate.me/search', {
          params: { keywords: query },
          headers: HEADERS,
          timeout: DEFAULT_TIMEOUT_MS,
        });

        const $ = cheerio.load(html);
        const cards = $('article, div[class*="job"], div[class*="offer"]').toArray().slice(0, 30);

        for (const card of cards) {
          const a = $(card).find('a[href]').first();
          let href = a.attr('href') ?? '';
          if (!href) continue;
          if (!href.startsWith('http')) href = 'https://relocate.me' + href;

          const title = $(card).find('h2, h3').first().text().trim() || a.text().trim();
          if (!title) continue;
          const text = $(card).text().replace(/\s+/g, ' ').trim();

          jobs.push({
            title,
            company: '',
            url: href,
            date: today,
            source: 'Relocate.me',
            _desc: text,
            stack: '',
            type: 'Relocation',
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
