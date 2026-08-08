import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RewardsService } from './rewards.service';

@ApiTags('rewards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('profiles/:profileId/rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post('daily-claim')
  @Roles(UserRole.PARENT)
  claimDaily(
    @CurrentUser() user: RequestUser,
    @Param('profileId') profileId: string,
  ) {
    return this.rewardsService.claimDailyReward(user.id, profileId);
  }

  @Post('treasure-chests/:chestId/open')
  @Roles(UserRole.PARENT)
  openChest(
    @CurrentUser() user: RequestUser,
    @Param('profileId') profileId: string,
    @Param('chestId') chestId: string,
  ) {
    return this.rewardsService.openTreasureChest(user.id, profileId, chestId);
  }
}
