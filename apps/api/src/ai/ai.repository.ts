import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from './entity/resume.entity';
import { ResumeAnalysis } from './entity/resume-analysis.entity';
import { Job } from '../jobs/entity/job.entity';

@Injectable()
export class AiRepository {
  constructor(
    @InjectRepository(Resume) readonly resumes: Repository<Resume>,
    @InjectRepository(ResumeAnalysis) readonly analyses: Repository<ResumeAnalysis>,
    // Cross-module, read-only access — see AiModule for why this doesn't
    // create a circular dependency with JobsModule.
    @InjectRepository(Job) readonly jobs: Repository<Job>,
  ) {}
}
