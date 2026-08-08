import { Module } from '@nestjs/common';
import { EconomyModule } from '../economy/economy.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [EconomyModule, ProfilesModule],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
