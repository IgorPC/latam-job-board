import axios from 'axios';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { ScrapingSource } from '../interfaces/scraping-context.interface';
import { RawJob } from '../interfaces/raw-job.interface';
import { HEADERS, DEFAULT_TIMEOUT_MS } from '../utils/http';

const BASE = 'https://fitnext.app.loxo.co';

export const fitnextSource: ScrapingSource = {
  key: 'fitnext',
  label: 'FitNext',
  async run() {
    const jobs: RawJob[] = [];
    const seen = new Set<string>();
    const today = dayjs().format('YYYY-MM-DD');

    const { data: html } = await axios.get(`${BASE}/fitnext`, {
      headers: HEADERS,
      timeout: DEFAULT_TIMEOUT_MS,
    });
    const $ = cheerio.load(html);

    $('a[href^="/job/"]').each((_, el) => {
      const path = $(el).attr('href') ?? '';
      const url = `${BASE}${path}`;
      if (seen.has(url)) return;
      seen.add(url);

      const title = $(el).text().trim();
      if (!title || title.length < 3) return;

      const $card = $(el).parent();
      const text = $card.text();
      const jobType = text.includes('Contract') ? 'Contract' : 'Full Time';
      const isRemote =
        $card
          .find('*')
          .filter((_, e) => $(e).text().trim() === 'wifi').length > 0 || text.toLowerCase().includes('remote');

      jobs.push({
        title,
        company: 'FitNext Consulting',
        url,
        date: today,
        source: 'FitNext',
        _desc: `${title} ${jobType}${isRemote ? ' remote' : ''}`,
        stack: '',
        type: isRemote ? 'Remote' : 'Onsite',
        salary: '',
      });
    });

    return jobs;
  },
};
