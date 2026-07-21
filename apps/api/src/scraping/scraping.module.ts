import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from '../jobs/entity/job.entity';
import { SettingsModule } from '../settings/settings.module';
import { ScrapingRepository } from './scraping.repository';
import { ScrapingService } from './scraping.service';
import { ScrapingCron } from './scraping.cron';
import { ScrapingController } from './scraping.controller';
import { ScrapingGateway } from './scraping.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Job]), SettingsModule],
  providers: [ScrapingRepository, ScrapingService, ScrapingCron, ScrapingGateway],
  controllers: [ScrapingController],
})
export class ScrapingModule {}
