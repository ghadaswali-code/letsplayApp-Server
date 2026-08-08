import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CurrencyType, LedgerSource } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { EconomyService } from '../economy/economy.service';
import { ProfilesService } from '../profiles/profiles.service';
import { CATALOG_ITEMS } from './catalog';
import { PurchaseItemDto } from './dto/purchase-item.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly economyService: EconomyService,
    private readonly profilesService: ProfilesService,
  ) {}

  async getCatalog() {
    await this.ensureCatalog();
    return this.prisma.catalogItem.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async listInventory(userId: string, profileId: string) {
    await this.profilesService.assertParentAccess(userId, profileId);
    return this.prisma.inventoryItem.findMany({
      where: { profileId },
      orderBy: { acquiredAt: 'desc' },
    });
  }

  async purchase(userId: string, profileId: string, dto: PurchaseItemDto) {
    await this.profilesService.assertParentAccess(userId, profileId);
    await this.ensureCatalog();

    const item = await this.prisma.catalogItem.findUnique({
      where: { id: dto.catalogItemId },
    });

    if (!item?.isActive) {
      throw new NotFoundException('Catalog item not found.');
    }

    const existing = await this.prisma.inventoryItem.findUnique({
      where: {
        profileId_key: {
          profileId,
          key: item.id,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Item already owned.');
    }

    return this.prisma.$transaction(async (tx) => {
      if (item.costStars > 0) {
        const wallet = await tx.wallet.findUniqueOrThrow({
          where: { profileId },
        });
        if (wallet.starsBalance < item.costStars) {
          throw new ConflictException('Insufficient stars balance.');
        }

        await this.economyService.grantWithinTransaction(
          tx,
          profileId,
          CurrencyType.STARS,
          -item.costStars,
          LedgerSource.AVATAR_PURCHASE,
          `purchase:${item.id}`,
          { itemId: item.id },
        );
      }

      return tx.inventoryItem.create({
        data: {
          profileId,
          catalogItemId: item.id,
          type: item.type,
          key: item.id,
          metadata: item.metadata ?? undefined,
        },
      });
    });
  }

  private async ensureCatalog() {
    await Promise.all(
      CATALOG_ITEMS.map((item) =>
        this.prisma.catalogItem.upsert({
          where: { id: item.id },
          create: {
            id: item.id,
            type: item.type,
            name: item.name,
            costStars: item.costStars,
          },
          update: {
            type: item.type,
            name: item.name,
            costStars: item.costStars,
            isActive: true,
          },
        }),
      ),
    );
  }
}
