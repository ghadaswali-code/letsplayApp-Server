import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateChildProfileDto {
  @ApiProperty({ example: 'Omar' })
  @IsString()
  @MinLength(2)
  displayName: string;

  @ApiPropertyOptional({ example: 2019 })
  @IsOptional()
  @IsInt()
  @Min(2014)
  @Max(2026)
  birthYear?: number;
}
