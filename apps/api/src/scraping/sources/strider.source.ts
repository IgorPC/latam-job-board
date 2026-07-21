import axios from 'axios';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { ScrapingSource } from '../interfaces/scraping-context.interface';
import { RawJob } from '../interfaces/raw-job.interface';
import { HEADERS, DEFAULT_TIMEOUT_MS } from '../utils/http';

export const striderSource: ScrapingSource = {
  key: 'strider',
  label: 'Strider',
  async run() {
    const jobs: RawJob[] = [];
    const seen = new Set<string>();
    const today = dayjs().format('YYYY-MM-DD');

    const { data: html } = await axios.get('https://www.onstrider.com/jobs', {
      headers: HEADERS,
      timeout: DEFAULT_TIMEOUT_MS,
    });
    const $ = cheerio.load(html);

    $('a[href^="/jobs/"]').each((_, el) => {
      const slug = $(el).attr('href') ?? '';
      if (!/^\/jobs\/[a-z0-9-]+-[a-f0-9]+$/.test(slug)) return;

      const url = `https://www.onstrider.com${slug}`;
      if (seen.has(url)) return;
      seen.add(url);

      const $card = $(el).closest('li').first();
      const title = $card.find('h2').text().trim();
      if (!title) return;

      const skills = $card
        .find('li:not(:has(a))')
        .map((_, t) => $(t).text().trim())
        .get()
        .filter((t) => t.length > 1 && !t.includes('Remote') && !t.includes('Company'));

      jobs.push({
        title,
        company: 'US Company via Strider',
        url,
        date: today,
        source: 'Strider',
        _desc: [title, ...skills].join(' '),
        stack: '',
        type: 'Remote',
        salary: '',
      });
    });

    return jobs;
  },
};
