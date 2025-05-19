import {
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsISO8601, 
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ConditionDto } from './condition.dto';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsISO8601()
  readonly startAt: string; // ISO 날짜 문자열

  @IsISO8601()
  readonly endAt: string;

  @IsBoolean()
  @IsOptional()
  readonly active?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionDto)
  readonly conditions: ConditionDto[];

}
