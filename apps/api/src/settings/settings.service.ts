import { Injectable, Logger } from '@nestjs/common';
import { SettingsRepository } from './settings.repository';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { DEFAULT_ENABLED_SOURCES, DEFAULT_LATAM_COUNTRY } from './entity/settings.entity';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly repo: SettingsRepository) {}

  async get() {
    // Piggybacks on the settings response (already fetched app-wide on load)
    // rather than a dedicated endpoint — same pattern as /ai/status's
    // aiEnabled, just one field instead of a whole extra round-trip.
    const editLocked = process.env.LOCK_EDIT === 'true';

    const current = await this.repo.findCurrent();
    if (!current) {
      this.logger.debug('get: no settings row yet, setupCompleted=false');
      return {
        id: 1,
        primaryStack: [],
        secondaryStack: [],
        jobType: null,
        enabledSources: DEFAULT_ENABLED_SOURCES,
        latamCountry: DEFAULT_LATAM_COUNTRY,
        setupCompleted: false,
        lastSyncAt: null,
        isScrapingRunning: false,
        editLocked,
      };
    }
    return { ...current, editLocked };
  }

  async save(dto: CreateSettingsDto) {
    const existing = await this.repo.findCurrent();

    const settings = this.repo.settings.create({
      id: 1,
      primaryStack: dto.primaryStack,
      secondaryStack: dto.secondaryStack,
      jobType: dto.jobType,
      latamCountry: dto.latamCountry || DEFAULT_LATAM_COUNTRY,
      enabledSources: existing?.enabledSources ?? DEFAULT_ENABLED_SOURCES,
      setupCompleted: true,
      lastSyncAt: existing?.lastSyncAt ?? null,
      isScrapingRunning: existing?.isScrapingRunning ?? false,
    });

    const saved = await this.repo.settings.save(settings);
    this.logger.log(
      `Settings saved primaryStack=${dto.primaryStack.join(',')} secondaryStack=${dto.secondaryStack.join(',')} jobType=${dto.jobType}`,
    );
    return saved;
  }
}
