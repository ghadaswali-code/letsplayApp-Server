import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CurrencyType, LedgerSource, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { EconomyService } from '../economy/economy.service';
import { ProfilesService } from '../profiles/profiles.service';
import {
  DAILY_REWARDS,
  STREAK_REWARDS,
  TREASURE_CHEST_REWARD,
} from './reward-rules';

type Transaction = Prisma.TransactionClient;

@Injectable()
export class RewardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profilesService: ProfilesService,
    private readonly economyService: EconomyService,
  ) {}

  async claimDailyReward(userId: string, profileId: string) {
    await this.profilesService.assertParentAccess(userId, profileId);

    return this.prisma.$transaction(async (tx) => {
      const today = this.utcDateOnly(new Date());
      const existing = await tx.dailyRewardClaim.findUnique({
        where: {
          profileId_claimDate: {
            profileId,
            claimDate: today,
          },
        },
      });

      if (existing) {
        throw new ConflictException('Daily reward already claimed.');
      }

      const claimCount = await tx.dailyRewardClaim.count({
        where: { profileId },
      });
      const reward = DAILY_REWARDS[claimCount % DAILY_REWARDS.length];

      const claim = await tx.dailyRewardClaim.create({
        data: {
          profileId,
          claimDate: today,
          dayIndex: reward.dayIndex,
          reward: reward,
        },
      });

      if ('stars' in reward) {
        await this.economyService.grantWithinTransaction(
          tx,
          profileId,
          CurrencyType.STARS,
          reward.stars,
          LedgerSource.DAILY_LOGIN,
          `daily:${today.toISOString()}`,
          reward,
        );
      }

      if ('chest' in reward) {
        await tx.treasureChest.create({
          data: {
            profileId,
            triggerLessonCount: 0 - reward.dayIndex,
            reward: { chestType: reward.chest },
          },
        });
      }

      await tx.auditEvent.create({
        data: {
          actorUserId: userId,
          profileId,
          action: 'daily_reward.claimed',
          metadata: reward,
        },
      });

      return claim;
    });
  }

  async openTreasureChest(userId: string, profileId: string, chestId: string) {
    await this.profilesService.assertParentAccess(userId, profileId);

    return this.prisma.$transaction(async (tx) => {
      const chest = await tx.treasureChest.findFirst({
        where: {
          id: chestId,
          profileId,
        },
      });

      if (!chest) {
        throw new NotFoundException('Treasure chest not found.');
      }

      if (chest.openedAt) {
        throw new ConflictException('Treasure chest already opened.');
      }

      await this.economyService.grantWithinTransaction(
        tx,
        profileId,
        CurrencyType.STARS,
        TREASURE_CHEST_REWARD.stars,
        LedgerSource.TREASURE_CHEST,
        `chest-stars:${chest.id}`,
        TREASURE_CHEST_REWARD,
      );

      await this.economyService.grantWithinTransaction(
        tx,
        profileId,
        CurrencyType.ENERGY,
        TREASURE_CHEST_REWARD.energy,
        LedgerSource.TREASURE_CHEST,
        `chest-energy:${chest.id}`,
        TREASURE_CHEST_REWARD,
      );

      return tx.treasureChest.update({
        where: { id: chest.id },
        data: {
          openedAt: new Date(),
          reward: TREASURE_CHEST_REWARD,
        },
      });
    });
  }

  async recordLearningActivity(tx: Transaction, profileId: string) {
    const today = this.utcDateOnly(new Date());
    const yesterday = this.utcDateOnly(
      new Date(Date.now() - 24 * 60 * 60 * 1000),
    );
    const streak = await tx.streak.findUnique({ where: { profileId } });

    if (streak?.lastActivityDate?.getTime() === today.getTime()) {
      return streak;
    }

    const currentDays =
      streak?.lastActivityDate?.getTime() === yesterday.getTime()
        ? (streak.currentDays ?? 0) + 1
        : 1;

    const updated = await tx.streak.upsert({
      where: { profileId },
      create: {
        profileId,
        currentDays,
        longestDays: currentDays,
        lastActivityDate: today,
      },
      update: {
        currentDays,
        longestDays: Math.max(streak?.longestDays ?? 0, currentDays),
        lastActivityDate: today,
      },
    });

    const reward = STREAK_REWARDS.get(currentDays);
    if (reward?.stars) {
      await this.economyService.grantWithinTransaction(
        tx,
        profileId,
        CurrencyType.STARS,
        reward.stars,
        LedgerSource.STREAK_MILESTONE,
        `streak:${currentDays}`,
        reward,
      );
    }

    return updated;
  }

  async createChestIfEligible(tx: Transaction, profileId: string) {
    const completions = await tx.lessonProgress.aggregate({
      where: { profileId },
      _sum: { completions: true },
    });

    const completedLessons = completions._sum.completions ?? 0;
    if (completedLessons === 0 || completedLessons % 5 !== 0) {
      return null;
    }

    return tx.treasureChest.upsert({
      where: {
        profileId_triggerLessonCount: {
          profileId,
          triggerLessonCount: completedLessons,
        },
      },
      create: {
        profileId,
        triggerLessonCount: completedLessons,
      },
      update: {},
    });
  }

  private utcDateOnly(date: Date) {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }
}
