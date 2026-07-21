import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapingSource } from '../interfaces/scraping-context.interface';
import { RawJob } from '../interfaces/raw-job.interface';
import { HEADERS, VISAJOBS_TIMEOUT_MS } from '../utils/http';
import { isRecent } from '../utils/filters';
import { parseRelativeDate } from '../utils/date-parser';

const TECH_KW = [
  'software', 'engineer', 'developer', 'backend', 'php', 'laravel',
  'nestjs', 'node.js', 'nodejs', 'javascript', 'typescript', 'api', 'fullstack',
];
const SKIP_KW = [
  'nurse', 'medical', 'doctor', 'chef', 'hospitality', 'accountant',
  'sales representative', 'customer service', 'lawyer', 'construction', 'electrician',
];

export const visaJobsSource: ScrapingSource = {
  key: 'visajobs',
  label: 'VisaJobs.xyz',
  async run({ maxAgeDays }) {
    const jobs: RawJob[] = [];
    const seen = new Set<string>();

    const { data: html } = await axios.get('https://visajobs.xyz/visa-sponsored-jobs/', {
      headers: HEADERS,
      timeout: VISAJOBS_TIMEOUT_MS,
    });
    const $ = cheerio.load(html);

    const headings = $('h3').toArray();
    for (const h3 of headings) {
      const aTitle = $(h3).find('a[href*="/visa-sponsored-jobs/"]');
      if (!aTitle.length) continue;
      const title = aTitle.text().trim();

      const tLower = title.toLowerCase();
      if (SKIP_KW.some((kw) => tLower.includes(kw))) continue;
      if (!TECH_KW.some((kw) => tLower.includes(kw))) continue;

      const siblingTexts: string[] = [];
      let applyUrl = '';
      let sib = $(h3).next();
      let count = 0;

      while (sib.length && count < 10) {
        if (sib.is('h3')) break;
        const text = sib.text().replace(/\s+/g, ' ').trim();
        if (text) siblingTexts.push(text);

        sib.find('a').each((_, a) => {
          const href = $(a).attr('href') ?? '';
          if ($(a).text().toLowerCase().includes('apply') && href.startsWith('http')) {
            applyUrl = href;
          }
        });

        sib = sib.next();
        count++;
      }

      const nearby = siblingTexts.join(' ');
      const dateMatch = nearby.match(/(\d+)\s+(day|week|month|hour)s?\s+ago/i);
      if (!dateMatch) continue;

      const pubDate = parseRelativeDate(dateMatch[0]);
      if (!isRecent(pubDate, maxAgeDays)) continue;

      if (!applyUrl) applyUrl = 'https://visajobs.xyz' + (aTitle.attr('href') ?? '');
      if (seen.has(applyUrl)) continue;
      seen.add(applyUrl);

      const company =
        siblingTexts.find((t) => t.length >= 3 && t.length <= 80 && !dateMatch[0].includes(t)) ?? '';

      jobs.push({
        title,
        company,
        url: applyUrl,
        date: pubDate,
        source: 'VisaJobs.xyz',
        _desc: `${title} ${nearby}`,
        stack: '',
        type: 'Relocation',
        salary: '',
      });
    }

    return jobs;
  },
};
