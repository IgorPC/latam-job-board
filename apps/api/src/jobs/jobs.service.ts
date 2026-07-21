import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import dayjs from 'dayjs';
import { Brackets, SelectQueryBuilder } from 'typeorm';
import { JobsRepository } from './jobs.repository';
import { SettingsRepository } from '../settings/settings.repository';
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

  constructor(
    private readonly repo: JobsRepository,
    private readonly settingsRepo: SettingsRepository,
  ) {}

  async list(dto: FilterJobsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;

    const stackKeywords = await this.getStackKeywords();
    if (stackKeywords.length === 0) {
      this.logger.debug('list: no configured stack yet, returning empty result');
      return { items: [], total: 0, page, totalPages: 1 };
    }

    const qb = this.repo.jobs.createQueryBuilder('job');
    this.applyStackScope(qb, stackKeywords);

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

    if (dto.sources && dto.sources.length > 0) {
      qb.andWhere('job.source IN (:...sources)', { sources: dto.sources });
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

  async getById(id: number) {
    const job = await this.repo.jobs.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    return this.toDetailView(job);
  }

  // Per-source job counts, scoped to the current profile (not the transient
  // search/type/latam/since filters) so the multi-select's counts stay put
  // while the user experiments with the other filters.
  async sourceCounts(): Promise<Array<{ source: string; count: number }>> {
    const stackKeywords = await this.getStackKeywords();
    if (stackKeywords.length === 0) return [];

    const qb = this.repo.jobs.createQueryBuilder('job');
    this.applyStackScope(qb, stackKeywords);
    qb.select('job.source', 'source').addSelect('COUNT(*)', 'count').groupBy('job.source').orderBy('count', 'DESC');

    const rows = await qb.getRawMany<{ source: string; count: string }>();
    return rows.map((row) => ({ source: row.source, count: parseInt(row.count, 10) }));
  }

  // No fallback to "show everything" — until the user has completed the
  // setup wizard, the board has no profile to scope results to, so it
  // shows nothing rather than an unfiltered dump of every scraped job.
  private async getStackKeywords(): Promise<string[]> {
    const settings = await this.settingsRepo.findCurrent();
    return settings?.setupCompleted
      ? [...settings.primaryStack, ...settings.secondaryStack].map((s) => s.toLowerCase())
      : [];
  }

  // Always scoped to the currently saved stack — so reconfiguring preferences
  // immediately narrows the board to the new profile, instead of mixing in
  // jobs that only matched a previous, since-replaced stack.
  private applyStackScope(qb: SelectQueryBuilder<Job>, stackKeywords: string[]): void {
    qb.andWhere(
      new Brackets((sub) => {
        stackKeywords.forEach((kw, i) => {
          sub.orWhere(`LOWER(job.stack) LIKE :stackKw${i} OR LOWER(job.title) LIKE :stackKw${i}`, {
            [`stackKw${i}`]: `%${kw}%`,
          });
        });
      }),
    );
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

  private toDetailView(job: Job) {
    return {
      ...this.toPublicView(job),
      description: job.description,
    };
  }
}
