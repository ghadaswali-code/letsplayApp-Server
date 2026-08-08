import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { DatabaseModule } from './database/database.module';
import { EconomyModule } from './modules/economy/economy.module';
import { FamiliesModule } from './modules/families/families.module';
import { IdentityModule } from './modules/identity/identity.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { ProgressModule } from './modules/progress/progress.module';
import { RewardsModule } from './modules/rewards/rewards.module';
import { appConfig } from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    DatabaseModule,
    IdentityModule,
    FamiliesModule,
    ProfilesModule,
    ProgressModule,
    EconomyModule,
    RewardsModule,
    AchievementsModule,
    InventoryModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
