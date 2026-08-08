import { Module } from '@nestjs/common';
import { EconomyModule } from '../economy/economy.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';

@Module({
  imports: [EconomyModule, ProfilesModule],
  controllers: [AchievementsController],
  providers: [AchievementsService],
  exports: [AchievementsService],
})
export class AchievementsModule {}
