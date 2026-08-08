import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class MasterLetterDto {
  @ApiProperty({ example: 'alef' })
  @IsString()
  letterKey: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  attempts: number;

  @ApiProperty({ example: 9 })
  @IsInt()
  @Min(0)
  correct: number;
}
