import { api } from '@/config/api';
import type { AiStatus, Resume, ResumeAnalysis } from '../types/ai.types';

export async function fetchAiStatus(): Promise<AiStatus> {
  const { data } = await api.get<AiStatus>('/ai/status');
  return data;
}

export async function fetchResumes(): Promise<Resume[]> {
  const { data } = await api.get<Resume[]>('/ai/resumes');
  return data;
}

export async function uploadResume(file: File): Promise<Resume> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<Resume>('/ai/resumes', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteResume(id: number): Promise<void> {
  await api.delete(`/ai/resumes/${id}`);
}

export async function analyzeResume(resumeId: number, jobId: number): Promise<ResumeAnalysis> {
  const { data } = await api.post<ResumeAnalysis>('/ai/analyze', { resumeId, jobId });
  return data;
}

export async function fetchAnalysisHistory(jobId: number): Promise<ResumeAnalysis[]> {
  const { data } = await api.get<ResumeAnalysis[]>(`/ai/analyze/job/${jobId}`);
  return data;
}
