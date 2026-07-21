import axios from 'axios';
import { Logger } from '@nestjs/common';
import { ScrapingSource } from '../interfaces/scraping-context.interface';
import { RawJob } from '../interfaces/raw-job.interface';
import { HEADERS, DEFAULT_TIMEOUT_MS } from '../utils/http';
import { sleep } from '../utils/rate-limiter';
import companies from '../data/remote-companies.json';

interface RemoteCompany {
  title: string;
  slug: string;
  region: string;
  careers_url: string;
  ats: 'lever' | 'greenhouse' | 'ashby' | 'workable' | 'breezy' | 'recruitee' | null;
  ats_slug: string | null;
  technologies: string[];
}

const TECH_TO_CATEGORY: Record<string, string[]> = {
  react: ['javascript', 'frontend'],
  vue: ['javascript', 'frontend'],
  angular: ['javascript', 'frontend'],
  nextjs: ['javascript', 'frontend'],
  node: ['javascript', 'backend'],
  nestjs: ['javascript', 'backend'],
  django: ['python', 'backend'],
  fastapi: ['python', 'backend'],
  flask: ['python', 'backend'],
  laravel: ['php', 'backend'],
  rails: ['ruby', 'backend'],
  spring: ['java', 'backend'],
  dotnet: ['.net', 'backend'],
  flutter: ['mobile'],
  'react native': ['mobile', 'javascript'],
};

function matchesStack(company: RemoteCompany, allStack: string[]): boolean {
  if (!company.technologies?.length) return true;
  return allStack.some((skill) => {
    if (company.technologies.includes(skill)) return true;
    return (TECH_TO_CATEGORY[skill] ?? []).some((cat) => company.technologies.includes(cat));
  });
}

const logger = new Logger('RemoteTechCompaniesSource');

export const remoteTechCompaniesSource: ScrapingSource = {
  key: 'remote-tech-companies',
  label: 'Remote Tech Companies',
  async run({ profile }) {
    const jobs: RawJob[] = [];
    const allStack = [...profile.primaryStack, ...profile.secondaryStack].map((s) => s.toLowerCase());

    const relevant = (companies as RemoteCompany[])
      .filter((c) => c.ats === 'lever' || c.ats === 'greenhouse' || c.ats === 'ashby' || c.ats === 'workable')
      .filter((c) => matchesStack(c, allStack));

    for (const company of relevant) {
      await sleep(800);
      try {
        if (company.ats === 'lever') {
          const { data } = await axios.get(`https://api.lever.co/v0/postings/${company.ats_slug}`, {
            params: { mode: 'json' },
            headers: HEADERS,
            timeout: DEFAULT_TIMEOUT_MS,
          });
          for (const job of Array.isArray(data) ? data : []) {
            jobs.push({
              title: job.text,
              company: company.title,
              url: job.hostedUrl,
              date: job.createdAt ? new Date(job.createdAt).toISOString().slice(0, 10) : '',
              source: 'Remote Companies (Lever)',
              _desc: [job.text, job.categories?.team ?? '', job.descriptionPlain ?? ''].join(' '),
              stack: '',
              type: 'Remote',
              salary: '',
            });
          }
        }

        if (company.ats === 'greenhouse') {
          const { data } = await axios.get(`https://boards-api.greenhouse.io/v1/boards/${company.ats_slug}/jobs`, {
            params: { content: true },
            headers: HEADERS,
            timeout: DEFAULT_TIMEOUT_MS,
          });
          for (const job of data?.jobs ?? []) {
            jobs.push({
              title: job.title,
              company: company.title,
              url: job.absolute_url,
              date: (job.updated_at ?? '').slice(0, 10),
              source: 'Remote Companies (Greenhouse)',
              _desc: [job.title, job.location?.name ?? '', job.content ?? ''].join(' '),
              stack: '',
              type: 'Remote',
              salary: '',
            });
          }
        }

        if (company.ats === 'ashby') {
          const { data } = await axios.post(
            `https://api.ashbyhq.com/posting-public/job-board/${company.ats_slug}`,
            {},
            { headers: HEADERS, timeout: DEFAULT_TIMEOUT_MS },
          );
          for (const job of data?.jobPostings ?? []) {
            jobs.push({
              title: job.title,
              company: company.title,
              url: job.jobUrl,
              date: job.publishedDate ? new Date(job.publishedDate).toISOString().slice(0, 10) : '',
              source: 'Remote Companies (Ashby)',
              _desc: [job.title, job.team ?? '', job.descriptionPlain ?? ''].join(' '),
              stack: '',
              type: 'Remote',
              salary: '',
            });
          }
        }

        if (company.ats === 'workable') {
          const { data } = await axios.post(
            `https://apply.workable.com/api/v3/accounts/${company.ats_slug}/jobs`,
            { query: '', location: [], remote: [] },
            { headers: HEADERS, timeout: DEFAULT_TIMEOUT_MS },
          );
          for (const job of data?.results ?? []) {
            jobs.push({
              title: job.title,
              company: company.title,
              url: `https://apply.workable.com/${company.ats_slug}/j/${job.shortcode}/`,
              date: job.created_at ? new Date(job.created_at).toISOString().slice(0, 10) : '',
              source: 'Remote Companies (Workable)',
              _desc: [job.title, job.department ?? ''].join(' '),
              stack: '',
              type: 'Remote',
              salary: '',
            });
          }
        }
      } catch (err) {
        logger.debug(`company=${company.slug} ats=${company.ats} failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return jobs;
  },
};
