import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Settings } from './entity/settings.entity';
import { SettingsRepository } from './settings.repository';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Settings])],
  providers: [SettingsRepository, SettingsService],
  controllers: [SettingsController],
  exports: [SettingsService, SettingsRepository],
})
export class SettingsModule {}
