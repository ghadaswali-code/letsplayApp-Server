import { Injectable } from '@nestjs/common';
import { CurrencyType, LedgerSource } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { EconomyService } from '../economy/economy.service';
import { ProfilesService } from '../profiles/profiles.service';
import { ACHIEVEMENT_RULES } from './achievement-rules';

@Injectable()
export class AchievementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly economyService: EconomyService,
    private readonly profilesService: ProfilesService,
  ) {}

  async listForProfile(userId: string, profileId: string) {
    await this.profilesService.assertParentAccess(userId, profileId);
    await this.ensureDefinitions();

    return this.prisma.profileAchievement.findMany({
      where: { profileId },
      include: { achievement: true },
      orderBy: { awardedAt: 'desc' },
    });
  }

  async evaluateProfile(profileId: string) {
    await this.ensureDefinitions();

    const [masteredLetters, perfectLessons] = await Promise.all([
      this.prisma.letterProgress.count({
        where: { profileId, masteredAt: { not: null } },
      }),
      this.prisma.lessonProgress.count({
        where: { profileId, bestRating: 3 },
      }),
    ]);

    const eligible = ACHIEVEMENT_RULES.filter((rule) => {
      if (rule.id === 'first-letter-mastered') {
        return masteredLetters >= 1;
      }
      if (rule.id === 'alphabet-explorer') {
        return masteredLetters >= 5;
      }
      if (rule.id === 'perfect-lesson') {
        return perfectLessons >= 1;
      }
      return false;
    });

    const awarded = [];
    for (const rule of eligible) {
      const created = await this.award(profileId, rule);
      if (created) {
        awarded.push(created);
      }
    }

    return awarded;
  }

  private async award(
    profileId: string,
    rule: (typeof ACHIEVEMENT_RULES)[number],
  ) {
    const existing = await this.prisma.profileAchievement.findUnique({
      where: {
        profileId_achievementId: {
          profileId,
          achievementId: rule.id,
        },
      },
    });

    if (existing) {
      return null;
    }

    return this.prisma.$transaction(async (tx) => {
      const achievement = await tx.profileAchievement.create({
        data: {
          profileId,
          achievementId: rule.id,
        },
        include: { achievement: true },
      });

      await this.economyService.grantWithinTransaction(
        tx,
        profileId,
        CurrencyType.STARS,
        rule.reward.stars,
        LedgerSource.ACHIEVEMENT,
        `achievement:${rule.id}`,
        rule.reward,
      );

      await tx.inventoryItem.upsert({
        where: {
          profileId_key: {
            profileId,
            key: rule.reward.badgeKey,
          },
        },
        create: {
          profileId,
          type: 'BADGE',
          key: rule.reward.badgeKey,
          metadata: { achievementId: rule.id },
        },
        update: {},
      });

      return achievement;
    });
  }

  private async ensureDefinitions() {
    await Promise.all(
      ACHIEVEMENT_RULES.map((rule) =>
        this.prisma.achievement.upsert({
          where: { id: rule.id },
          create: {
            id: rule.id,
            name: rule.name,
            description: rule.description,
            reward: rule.reward,
          },
          update: {
            name: rule.name,
            description: rule.description,
            reward: rule.reward,
            isActive: true,
          },
        }),
      ),
    );
  }
}
