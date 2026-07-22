import axios from 'axios';
import { ScrapingSource } from '../interfaces/scraping-context.interface';
import { RawJob } from '../interfaces/raw-job.interface';
import { HEADERS, DEFAULT_TIMEOUT_MS } from '../utils/http';
import { isRelevant, isRecent } from '../utils/filters';
import { extractSalary, formatSalaryRange } from '../utils/detectors';
import { sleep } from '../utils/rate-limiter';

export const jobicySource: ScrapingSource = {
  key: 'jobicy',
  label: 'Jobicy',
  async run({ profile, maxAgeDays }) {
    const jobs: RawJob[] = [];

    for (const keyword of profile.primaryStack) {
      try {
        const { data } = await axios.get('https://jobicy.com/api/v2/remote-jobs', {
          params: { tag: keyword, count: 50 },
          headers: HEADERS,
          timeout: DEFAULT_TIMEOUT_MS,
        });

        for (const job of data?.jobs ?? []) {
          const desc = job.jobDescription ?? '';
          if (!isRelevant(job.jobTitle ?? '', desc, profile)) continue;

          const pubDate = (job.pubDate ?? '').slice(0, 10);
          if (!isRecent(pubDate, maxAgeDays)) continue;

          const salary =
            formatSalaryRange(job.salaryCurrency ?? 'USD', job.annualSalaryMin, job.annualSalaryMax) || extractSalary(desc);

          jobs.push({
            title: job.jobTitle,
            company: job.companyName ?? '',
            url: job.url,
            date: pubDate,
            source: 'Jobicy',
            _desc: desc,
            stack: '',
            type: job.jobGeo === 'Worldwide' ? 'Remote' : '',
            salary,
          });
        }
      } catch {
      }
      await sleep(1000);
    }

    return jobs;
  },
};
