import { IsArray, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export const JOBS_SINCE_VALUES = ['24h', '3d', '7d', 'all'] as const;
export const JOBS_TYPE_VALUES = ['remote', 'relocation', 'both'] as const;
export const JOBS_LATAM_VALUES = ['yes', 'no', 'maybe'] as const;
export const JOBS_SORT_VALUES = ['recent'] as const;

export type JobsSince = (typeof JOBS_SINCE_VALUES)[number];
export type JobsType = (typeof JOBS_TYPE_VALUES)[number];
export type JobsLatam = (typeof JOBS_LATAM_VALUES)[number];

export class FilterJobsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  search?: string;

  @IsOptional()
  @IsIn(JOBS_SINCE_VALUES)
  since?: JobsSince;

  @IsOptional()
  @IsIn(JOBS_TYPE_VALUES)
  type?: JobsType;

  @IsOptional()
  @IsIn(JOBS_LATAM_VALUES)
  latam?: JobsLatam;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  sources?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsIn(JOBS_SORT_VALUES)
  sort?: (typeof JOBS_SORT_VALUES)[number] = 'recent';
}
