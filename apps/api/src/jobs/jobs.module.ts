import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entity/job.entity';
import { SettingsModule } from '../settings/settings.module';
import { JobsRepository } from './jobs.repository';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Job]), SettingsModule],
  providers: [JobsRepository, JobsService],
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule {}
