import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Job } from '../jobs/entity/job.entity';
import { ProcessedJob } from './interfaces/raw-job.interface';

@Injectable()
export class ScrapingRepository {
  private readonly logger = new Logger(ScrapingRepository.name);

  constructor(
    @InjectRepository(Job) readonly jobs: Repository<Job>,
    private readonly dataSource: DataSource,
  ) {}

  // Raw parameterized INSERT IGNORE — TypeORM's QueryBuilder insert().orIgnore()
  // fails on MySQL as soon as any row is ignored: it tries to re-select the
  // inserted row by id to hydrate generated columns (createdAt), but an
  // ignored row has insertId=0, which TypeORM treats as "id not set" and throws.
  async saveJobs(jobs: ProcessedJob[]): Promise<number> {
    const eligible = jobs.filter((job) => job.acceptsLatam !== 'No');

    let newCount = 0;
    for (const job of eligible) {
      const result = await this.dataSource.query(
        `INSERT IGNORE INTO jobs (title, company, source, url, stack, description, type, salary, accepts_latam, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          job.title,
          job.company,
          job.source,
          job.url,
          job.stack,
          job.description,
          job.type,
          job.salary,
          job.acceptsLatam,
          job.date || null,
        ],
      );

      if (result?.affectedRows > 0) newCount++;
    }

    this.logger.log(`saveJobs eligible=${eligible.length} new=${newCount}`);
    return newCount;
  }
}
