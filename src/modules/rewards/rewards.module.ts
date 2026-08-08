import { Module } from '@nestjs/common';
import { EconomyModule } from '../economy/economy.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';

@Module({
  imports: [EconomyModule, ProfilesModule],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
