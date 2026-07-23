import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class AnalyzeResumeDto {
  @Type(() => Number)
  @IsInt()
  resumeId: number;

  @Type(() => Number)
  @IsInt()
  jobId: number;
}
