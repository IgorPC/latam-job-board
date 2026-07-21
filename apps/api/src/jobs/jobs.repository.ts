import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './entity/job.entity';

@Injectable()
export class JobsRepository {
  constructor(@InjectRepository(Job) readonly jobs: Repository<Job>) {}
}
