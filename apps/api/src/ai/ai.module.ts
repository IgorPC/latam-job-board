import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiRepository } from './ai.repository';
import { Resume } from './entity/resume.entity';
import { ResumeAnalysis } from './entity/resume-analysis.entity';
import { Job } from '../jobs/entity/job.entity';

@Module({
  // Job is registered here too (not imported from JobsModule) purely to get
  // a read-only Repository<Job> for cross-module lookups during analysis —
  // it does not re-declare the jobs feature or create a circular dependency.
  imports: [TypeOrmModule.forFeature([Resume, ResumeAnalysis, Job])],
  controllers: [AiController],
  providers: [AiService, AiRepository],
})
export class AiModule {}
