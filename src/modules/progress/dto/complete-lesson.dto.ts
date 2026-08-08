import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, Min } from 'class-validator';

export class CompleteLessonDto {
  @ApiProperty({ example: 'letters-alef-001' })
  @IsString()
  lessonId: string;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(1)
  totalQuestions: number;

  @ApiProperty({ example: 18 })
  @IsInt()
  @Min(0)
  correctAnswers: number;

  @ApiProperty({ example: 15 })
  @IsInt()
  @Min(0)
  firstAttemptCorrect: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0)
  mistakes: number;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  hintsUsed: number;

  @ApiProperty({ example: 240 })
  @IsInt()
  @Min(1)
  @Max(7200)
  timeSpentSeconds: number;
}
