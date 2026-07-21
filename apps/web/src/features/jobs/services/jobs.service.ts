import { api } from '@/config/api';
import type { JobDetail, JobsQuery, JobsResponse, SourceCount } from '../types/job.types';

export async function fetchJobs(query: JobsQuery): Promise<JobsResponse> {
  const { data } = await api.get<JobsResponse>('/jobs', { params: query });
  return data;
}

export async function fetchJobById(id: number): Promise<JobDetail> {
  const { data } = await api.get<JobDetail>(`/jobs/${id}`);
  return data;
}

export async function fetchSourceCounts(): Promise<SourceCount[]> {
  const { data } = await api.get<SourceCount[]>('/jobs/source-counts');
  return data;
}
