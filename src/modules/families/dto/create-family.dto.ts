import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateFamilyDto {
  @ApiProperty({ example: 'Khan Family' })
  @IsString()
  @MinLength(2)
  name: string;
}
