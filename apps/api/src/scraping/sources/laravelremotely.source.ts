import axios from 'axios';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { ScrapingSource } from '../interfaces/scraping-context.interface';
import { RawJob } from '../interfaces/raw-job.interface';
import { HEADERS, DEFAULT_TIMEOUT_MS } from '../utils/http';

export const laravelRemotelySource: ScrapingSource = {
  key: 'laravelremotely',
  label: 'LaravelRemotely',
  async run() {
    const jobs: RawJob[] = [];
    const today = dayjs().format('YYYY-MM-DD');

    const { data: html } = await axios.get('https://laravelremotely.com/', {
      headers: HEADERS,
      timeout: DEFAULT_TIMEOUT_MS,
    });
    const $ = cheerio.load(html);

    const links = $('a[href^="/remote-laravel-jobs/"]').toArray();
    for (const el of links) {
      const url = 'https://laravelremotely.com' + $(el).attr('href');
      const raw = $(el).text().replace(/\s+/g, ' ').trim();

      const parts = raw.split(/\s+is hiring\s+/i);
      if (parts.length < 2) continue;

      let companyPart = parts[0].replace(/^jobs in /i, '').trim();
      const words = companyPart.split(' ');
      for (let i = 1; i <= Math.floor(words.length / 2); i++) {
        if (words.slice(0, i).join(' ') === words.slice(i, 2 * i).join(' ')) {
          companyPart = words.slice(0, i).join(' ');
          break;
        }
      }

      const after = parts[1].replace(/^an?\s+/i, '').trim();
      const inMatch = after.match(/\s+in\s+/);
      const title = inMatch ? after.slice(0, inMatch.index).trim() : after;
      const tags = inMatch ? after.slice(inMatch.index! + inMatch[0].length).trim() : '';
      if (!title) continue;

      jobs.push({
        title,
        company: companyPart,
        url,
        date: today,
        source: 'LaravelRemotely',
        _desc: `${title} ${tags}`,
        stack: 'Laravel',
        type: 'Remote',
        salary: '',
      });
    }

    return jobs;
  },
};
