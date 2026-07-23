export const AI_CONTROLLER_PATH = 'ai';

export const AI_ROUTES = {
  STATUS: 'status',
  UPLOAD_RESUME: 'resumes',
  LIST_RESUMES: 'resumes',
  DELETE_RESUME: 'resumes/:id',
  ANALYZE: 'analyze',
  ANALYSIS_HISTORY: 'analyze/job/:jobId',
} as const;

export const MAX_RESUMES = 5;
export const MAX_RESUME_FILE_BYTES = 5 * 1024 * 1024;
