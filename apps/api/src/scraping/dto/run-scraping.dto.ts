import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean } from 'class-validator';

export class RunScrapingDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  initialRun?: boolean;
}
