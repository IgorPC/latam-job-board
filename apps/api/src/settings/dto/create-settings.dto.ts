import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { DEFAULT_LATAM_COUNTRY, SettingsJobType } from '../entity/settings.entity';
import {
  PRIMARY_STACK_MAX,
  PRIMARY_STACK_MIN,
  SECONDARY_STACK_MAX,
  SECONDARY_STACK_MIN,
  STACK_ITEM_MAX_LENGTH,
} from '../consts/settings.consts';

const normalizeStack = ({ value }: { value: unknown }) =>
  Array.isArray(value) ? value.map((v) => (typeof v === 'string' ? v.trim().toLowerCase() : v)) : value;

export class CreateSettingsDto {
  @IsArray()
  @ArrayMinSize(PRIMARY_STACK_MIN)
  @ArrayMaxSize(PRIMARY_STACK_MAX)
  @IsString({ each: true })
  @MaxLength(STACK_ITEM_MAX_LENGTH, { each: true })
  @Transform(normalizeStack)
  primaryStack: string[];

  @IsArray()
  @ArrayMinSize(SECONDARY_STACK_MIN)
  @ArrayMaxSize(SECONDARY_STACK_MAX)
  @IsString({ each: true })
  @MaxLength(STACK_ITEM_MAX_LENGTH, { each: true })
  @Transform(normalizeStack)
  secondaryStack: string[] = [];

  @IsEnum(SettingsJobType)
  jobType: SettingsJobType;

  // English name only (e.g. "Brazil", "Argentina") — matched as a keyword
  // against scraped job text, so it must be spelled the way postings
  // themselves would spell it.
  @IsOptional()
  @IsString()
  @MaxLength(60)
  @Matches(/^[a-zA-Z\s-]+$/, { message: 'latamCountry must be spelled in English (letters, spaces, hyphens only)' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  latamCountry: string = DEFAULT_LATAM_COUNTRY;
}
