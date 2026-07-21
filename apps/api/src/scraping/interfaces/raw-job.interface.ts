export interface RawJob {
  date: string;
  source: string;
  title: string;
  company: string;
  url: string;
  _desc: string;
  stack: string;
  type: string;
  salary: string;
}

export type ProcessedJob = Omit<RawJob, '_desc'> & {
  acceptsLatam: 'Yes' | 'No' | 'Maybe';
};
