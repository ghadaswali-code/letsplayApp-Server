import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PurchaseItemDto } from './dto/purchase-item.dto';
import { InventoryService } from './inventory.service';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('profiles/:profileId/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('catalog')
  @Roles(UserRole.PARENT)
  catalog() {
    return this.inventoryService.getCatalog();
  }

  @Get()
  @Roles(UserRole.PARENT)
  list(
    @CurrentUser() user: RequestUser,
    @Param('profileId') profileId: string,
  ) {
    return this.inventoryService.listInventory(user.id, profileId);
  }

  @Post('purchase')
  @Roles(UserRole.PARENT)
  purchase(
    @CurrentUser() user: RequestUser,
    @Param('profileId') profileId: string,
    @Body() dto: PurchaseItemDto,
  ) {
    return this.inventoryService.purchase(user.id, profileId, dto);
  }
}
