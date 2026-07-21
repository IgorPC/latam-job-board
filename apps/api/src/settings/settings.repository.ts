import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './entity/settings.entity';

@Injectable()
export class SettingsRepository {
  constructor(@InjectRepository(Settings) readonly settings: Repository<Settings>) {}

  findCurrent() {
    return this.settings.findOne({ where: { id: 1 } });
  }
}
