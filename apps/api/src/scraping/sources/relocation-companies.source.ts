import axios from 'axios';
import * as cheerio from 'cheerio';
import { Logger } from '@nestjs/common';
import { ScrapingSource } from '../interfaces/scraping-context.interface';
import { RawJob } from '../interfaces/raw-job.interface';
import { HEADERS, DEFAULT_TIMEOUT_MS } from '../utils/http';
import { sleep } from '../utils/rate-limiter';

const README_URL =
  'https://raw.githubusercontent.com/AndrewStetsenko/tech-jobs-with-relocation/master/README.md';

const logger = new Logger('RelocationCompaniesSource');

async function extractTokens(): Promise<{ greenhouse: string[]; lever: string[] }> {
  try {
    const { data: text } = await axios.get(README_URL, { headers: HEADERS, timeout: DEFAULT_TIMEOUT_MS });
    const greenhouse = [
      ...new Set(
        [...(text.matchAll(/boards(?:\.eu)?\.greenhouse\.io\/([A-Za-z0-9_-]+)/g) as any)].map((m) => m[1]),
      ),
    ] as string[];
    const lever = [
      ...new Set([...(text.matchAll(/jobs\.lever\.co\/([A-Za-z0-9_-]+)/g) as any)].map((m) => m[1])),
    ] as string[];
    return { greenhouse, lever };
  } catch (err) {
    logger.warn(`README fetch failed, using extra tokens only: ${err instanceof Error ? err.message : String(err)}`);
    return { greenhouse: [], lever: [] };
  }
}

export const relocationCompaniesSource: ScrapingSource = {
  key: 'relocation-companies',
  label: 'Relocation Companies',
  async run() {
    const jobs: RawJob[] = [];
    const { greenhouse, lever } = await extractTokens();

    for (const token of greenhouse) {
      await sleep(800);
      try {
        const { data } = await axios.get(`https://boards-api.greenhouse.io/v1/boards/${token}/jobs`, {
          params: { content: true },
          headers: HEADERS,
          timeout: DEFAULT_TIMEOUT_MS,
        });
        const companyName = data?.name ?? token;
        for (const job of data?.jobs ?? []) {
          const desc = job.content ? cheerio.load(job.content).text() : '';
          jobs.push({
            title: job.title,
            company: companyName,
            url: job.absolute_url,
            date: (job.updated_at ?? '').slice(0, 10),
            source: 'Relocation Companies (Greenhouse)',
            _desc: desc,
            stack: '',
            type: 'Relocation',
            salary: '',
          });
        }
      } catch (err: any) {
        logger.debug(`greenhouse token=${token} failed status=${err?.response?.status ?? 'n/a'}`);
      }
    }

    for (const token of lever) {
      await sleep(800);
      try {
        const { data } = await axios.get(`https://api.lever.co/v0/postings/${token}`, {
          params: { content: true, mode: 'json' },
          headers: HEADERS,
          timeout: DEFAULT_TIMEOUT_MS,
        });
        const postings = Array.isArray(data) ? data : (data?.postings ?? []);
        for (const job of postings) {
          const desc = `${job.descriptionPlain ?? ''} ${(job.lists ?? []).map((l: any) => l.content).join(' ')}`;
          jobs.push({
            title: job.text,
            company: token,
            url: job.hostedUrl,
            date: job.createdAt ? new Date(job.createdAt).toISOString().slice(0, 10) : '',
            source: 'Relocation Companies (Lever)',
            _desc: desc,
            stack: '',
            type: 'Relocation',
            salary: '',
          });
        }
      } catch (err: any) {
        logger.debug(`lever token=${token} failed status=${err?.response?.status ?? 'n/a'}`);
      }
    }

    return jobs;
  },
};
