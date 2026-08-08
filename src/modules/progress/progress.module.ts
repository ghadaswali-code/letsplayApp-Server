import { Module } from '@nestjs/common';
import { AchievementsModule } from '../achievements/achievements.module';
import { EconomyModule } from '../economy/economy.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { RewardsModule } from '../rewards/rewards.module';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  imports: [ProfilesModule, EconomyModule, RewardsModule, AchievementsModule],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
