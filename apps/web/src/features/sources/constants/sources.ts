export interface SourceMeta {
  key: string;
  label: string;
  initials: string;
  gradient: string;
  url: string;
}

export const SOURCES: SourceMeta[] = [
  { key: 'remoteok', label: 'Remote OK', initials: 'RO', gradient: 'from-red-500 to-orange-500', url: 'https://remoteok.com' },
  { key: 'arbeitnow', label: 'Arbeitnow', initials: 'AN', gradient: 'from-blue-500 to-cyan-500', url: 'https://www.arbeitnow.com' },
  {
    key: 'weworkremotely',
    label: 'We Work Remotely',
    initials: 'WWR',
    gradient: 'from-emerald-500 to-teal-500',
    url: 'https://weworkremotely.com',
  },
  {
    key: 'workingnomads',
    label: 'Working Nomads',
    initials: 'WN',
    gradient: 'from-amber-500 to-yellow-500',
    url: 'https://www.workingnomads.com',
  },
  { key: 'jobgether', label: 'Jobgether', initials: 'JG', gradient: 'from-indigo-500 to-blue-500', url: 'https://jobgether.com' },
  { key: 'relocateme', label: 'Relocate.me', initials: 'RM', gradient: 'from-pink-500 to-rose-500', url: 'https://relocate.me' },
  {
    key: 'dynamitejobs',
    label: 'Dynamite Jobs',
    initials: 'DJ',
    gradient: 'from-orange-500 to-red-600',
    url: 'https://dynamitejobs.com',
  },
  { key: 'dice', label: 'Dice', initials: 'DC', gradient: 'from-red-600 to-red-800', url: 'https://www.dice.com' },
  { key: 'visajobs', label: 'VisaJobs.xyz', initials: 'VJ', gradient: 'from-violet-500 to-purple-600', url: 'https://visajobs.xyz' },
  {
    key: 'laravelremotely',
    label: 'LaravelRemotely',
    initials: 'LR',
    gradient: 'from-red-500 to-rose-600',
    url: 'https://laravelremotely.com',
  },
  { key: 'larajobs', label: 'LaraJobs', initials: 'LJ', gradient: 'from-orange-500 to-amber-600', url: 'https://larajobs.com' },
  {
    key: 'relocation-companies',
    label: 'Relocation Companies',
    initials: 'RC',
    gradient: 'from-cyan-500 to-blue-600',
    url: 'https://github.com/AndrewStetsenko/tech-jobs-with-relocation',
  },
  { key: 'himalayas', label: 'Himalayas', initials: 'HM', gradient: 'from-sky-500 to-indigo-500', url: 'https://himalayas.app' },
  { key: 'jobicy', label: 'Jobicy', initials: 'JC', gradient: 'from-lime-500 to-green-600', url: 'https://jobicy.com' },
  { key: 'jsremotely', label: 'JS Remotely', initials: 'JS', gradient: 'from-yellow-400 to-amber-500', url: 'https://jsremotely.com' },
  {
    key: 'cryptojobslist',
    label: 'Crypto Jobs List',
    initials: 'CJ',
    gradient: 'from-purple-500 to-fuchsia-600',
    url: 'https://cryptojobslist.com',
  },
  { key: 'strider', label: 'Strider', initials: 'ST', gradient: 'from-teal-500 to-cyan-600', url: 'https://www.onstrider.com' },
  { key: 'fitnext', label: 'FitNext', initials: 'FN', gradient: 'from-green-500 to-emerald-600', url: 'https://fitnext.app.loxo.co/fitnext' },
  {
    key: 'remote-tech-companies',
    label: 'Remote Tech Companies',
    initials: 'RTC',
    gradient: 'from-blue-600 to-indigo-700',
    url: 'https://github.com/remoteintech/remote-jobs',
  },
];
