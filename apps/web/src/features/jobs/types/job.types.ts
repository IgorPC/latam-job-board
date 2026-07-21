export type JobSince = '24h' | '3d' | '7d' | 'all';
export type JobTypeFilter = 'remote' | 'relocation' | 'both';
export type JobLatamFilter = 'yes' | 'no' | 'maybe';

export interface Job {
  id: number;
  title: string;
  company: string;
  source: string;
  url: string;
  stack: string;
  type: string;
  salary: string;
  acceptsLatam: 'Yes' | 'No' | 'Maybe';
  publishedAt: string | null;
  createdAt: string;
}

export interface JobDetail extends Job {
  description: string | null;
}

export interface JobsQuery {
  search?: string;
  since?: JobSince;
  type?: JobTypeFilter;
  latam?: JobLatamFilter;
  sources?: string[];
  page?: number;
  limit?: number;
}

export interface JobsResponse {
  items: Job[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SourceCount {
  source: string;
  count: number;
}
