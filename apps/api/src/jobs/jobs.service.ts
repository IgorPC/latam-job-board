import { Injectable, Logger } from '@nestjs/common';
import dayjs from 'dayjs';
import { JobsRepository } from './jobs.repository';
import { FilterJobsDto } from './dto/filter-jobs.dto';
import { Job } from './entity/job.entity';

const TYPE_MATCH: Record<string, string> = {
  remote: 'Remote',
  relocation: 'Relocation',
};

const LATAM_MATCH: Record<string, string> = {
  yes: 'Yes',
  no: 'No',
  maybe: 'Maybe',
};

const SINCE_DAYS: Record<string, number> = {
  '24h': 1,
  '3d': 3,
  '7d': 7,
};

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(private readonly repo: JobsRepository) {}

  async list(dto: FilterJobsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;

    const qb = this.repo.jobs.createQueryBuilder('job');

    if (dto.search) {
      qb.andWhere(
        '(job.title LIKE :search OR job.company LIKE :search OR job.stack LIKE :search)',
        { search: `%${dto.search}%` },
      );
    }

    if (dto.type && dto.type !== 'both' && TYPE_MATCH[dto.type]) {
      qb.andWhere('job.type LIKE :type', { type: `%${TYPE_MATCH[dto.type]}%` });
    }

    if (dto.latam && LATAM_MATCH[dto.latam]) {
      qb.andWhere('job.acceptsLatam = :latam', { latam: LATAM_MATCH[dto.latam] });
    }

    if (dto.since && dto.since !== 'all' && SINCE_DAYS[dto.since]) {
      const threshold = dayjs().subtract(SINCE_DAYS[dto.since], 'day').format('YYYY-MM-DD');
      qb.andWhere('job.publishedAt >= :threshold', { threshold });
    }

    qb.orderBy('job.publishedAt', 'DESC').addOrderBy('job.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    this.logger.debug(`list returned ${items.length}/${total} jobs page=${page} limit=${limit}`);

    return {
      items: items.map((job) => this.toPublicView(job)),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  private toPublicView(job: Job) {
    return {
      id: job.id,
      title: job.title,
      company: job.company,
      source: job.source,
      url: job.url,
      stack: job.stack,
      type: job.type,
      salary: job.salary,
      acceptsLatam: job.acceptsLatam,
      publishedAt: job.publishedAt,
      createdAt: job.createdAt,
    };
  }
}
