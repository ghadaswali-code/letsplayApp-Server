import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CompleteLessonDto } from './dto/complete-lesson.dto';
import { MasterLetterDto } from './dto/master-letter.dto';
import { ProgressService } from './progress.service';

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('profiles/:profileId/progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('lessons/complete')
  @Roles(UserRole.PARENT)
  completeLesson(
    @CurrentUser() user: RequestUser,
    @Param('profileId') profileId: string,
    @Body() dto: CompleteLessonDto,
  ) {
    return this.progressService.completeLesson(user.id, profileId, dto);
  }

  @Post('letters/master')
  @Roles(UserRole.PARENT)
  masterLetter(
    @CurrentUser() user: RequestUser,
    @Param('profileId') profileId: string,
    @Body() dto: MasterLetterDto,
  ) {
    return this.progressService.masterLetter(user.id, profileId, dto);
  }

  @Get()
  @Roles(UserRole.PARENT)
  getProgress(
    @CurrentUser() user: RequestUser,
    @Param('profileId') profileId: string,
  ) {
    return this.progressService.getProgress(user.id, profileId);
  }
}
