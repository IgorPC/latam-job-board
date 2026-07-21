import { Body, Controller, Get, HttpException, InternalServerErrorException, Logger, Post } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { SETTINGS_CONTROLLER_PATH, SETTINGS_ROUTES } from './consts/endpoints';

@Controller(SETTINGS_CONTROLLER_PATH)
export class SettingsController {
  private readonly logger = new Logger(SettingsController.name);

  constructor(private readonly settings: SettingsService) {}

  @Get(SETTINGS_ROUTES.GET)
  async get() {
    try {
      return await this.settings.get();
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.error('get failed', err instanceof Error ? err.stack : String(err));
      throw new InternalServerErrorException();
    }
  }

  @Post(SETTINGS_ROUTES.CREATE)
  async save(@Body() dto: CreateSettingsDto) {
    try {
      return await this.settings.save(dto);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.error('save failed', err instanceof Error ? err.stack : String(err));
      throw new InternalServerErrorException();
    }
  }
}
