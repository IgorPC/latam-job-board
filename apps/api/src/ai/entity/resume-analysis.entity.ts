import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export interface AnalysisImprovement {
  area: string;
  suggestion: string;
}

// One row per analysis run — never deduplicated or cached against a prior
// (resumeId, jobId) pair, so the user can re-run as many analyses as they
// want and browse the full history for a job.
@Entity('resume_analyses')
@Index(['jobId', 'createdAt'])
export class ResumeAnalysis {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'resume_id' })
  resumeId: number;

  // Denormalized so history stays readable even if the resume is later deleted.
  @Column({ name: 'resume_filename', length: 255 })
  resumeFilename: string;

  @Column({ name: 'job_id' })
  jobId: number;

  // MySQL/TypeORM returns `decimal` columns as strings by default — the
  // transformer coerces it back to a number so consumers never need to
  // remember to parse it themselves.
  @Column({
    type: 'decimal',
    precision: 3,
    scale: 1,
    transformer: { to: (value: number) => value, from: (value: string) => parseFloat(value) },
  })
  score: number;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'json' })
  strengths: string[];

  @Column({ type: 'json' })
  gaps: string[];

  @Column({ type: 'json' })
  improvements: AnalysisImprovement[];

  @Column({ type: 'text' })
  verdict: string;

  @Column({ name: 'model_used', length: 50 })
  modelUsed: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
