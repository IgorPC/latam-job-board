export const MAX_AGE_DAYS_CRON = 1;
export const MAX_AGE_DAYS_INITIAL_RUN = 15;
export const CRON_SCHEDULE = '0 9 * * *';

export const NICHE_SOURCE_RULES: Array<{ source: string; keywords: string[] }> = [
  { source: 'laravelremotely', keywords: ['laravel', 'php'] },
  { source: 'larajobs', keywords: ['laravel', 'php'] },
  { source: 'jsremotely', keywords: ['javascript', 'typescript', 'react', 'vue', 'node', 'nodejs', 'nestjs'] },
  { source: 'cryptojobslist', keywords: ['solidity', 'web3', 'blockchain', 'ethereum'] },
];
