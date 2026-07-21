import axios from 'axios';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { ScrapingSource } from '../interfaces/scraping-context.interface';
import { RawJob } from '../interfaces/raw-job.interface';
import { HEADERS, DEFAULT_TIMEOUT_MS } from '../utils/http';
import { isRelevant, isRecent } from '../utils/filters';
import { sleep } from '../utils/rate-limiter';

const CATEGORIES = ['back-end-development', 'it-development'];
const IGNORED_LINK_TEXT = ['view job', 'apply', 'see job'];
const MAX_PAGES = 3;

export const jobgetherSource: ScrapingSource = {
  key: 'jobgether',
  label: 'Jobgether',
  async run({ profile, maxAgeDays }) {
    const jobs: RawJob[] = [];
    const seen = new Set<string>();
    const today = dayjs().format('YYYY-MM-DD');

    for (const category of CATEGORIES) {
      for (let page = 1; page <= MAX_PAGES; page++) {
        let html = '';
        try {
          const res = await axios.get(`https://jobgether.com/remote-jobs/${category}`, {
            params: page > 1 ? { page } : {},
            headers: HEADERS,
            timeout: DEFAULT_TIMEOUT_MS,
          });
          html = res.data;
        } catch {
          break;
        }

        const $ = cheerio.load(html);
        const offerLinks = $('a[href^="/offer/"]').toArray();
        if (!offerLinks.length) break;

        for (const el of offerLinks) {
          const href = 'https://jobgether.com' + $(el).attr('href');
          const title = $(el).text().trim();
          if (!title || IGNORED_LINK_TEXT.includes(title.toLowerCase())) continue;
          if (seen.has(href)) continue;
          seen.add(href);

          const context = $(el).closest('article, li, div').text().replace(/\s+/g, ' ').trim();
          if (!isRelevant(title, context, profile)) continue;
          if (!isRecent(today, maxAgeDays)) continue;

          jobs.push({
            title,
            company: '',
            url: href,
            date: today,
            source: 'Jobgether',
            _desc: context,
            stack: '',
            type: 'Remote',
            salary: '',
          });
        }

        await sleep(2000);
      }
    }

    return jobs;
  },
};
