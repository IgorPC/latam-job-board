export interface Resume {
  id: number;
  filename: string;
  fileSizeBytes: number;
  createdAt: string;
}

export interface AnalysisImprovement {
  area: string;
  suggestion: string;
}

export interface ResumeAnalysis {
  id: number;
  resumeId: number;
  resumeFilename: string;
  jobId: number;
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  improvements: AnalysisImprovement[];
  verdict: string;
  modelUsed: string;
  createdAt: string;
}

export interface AiStatus {
  aiEnabled: boolean;
}
