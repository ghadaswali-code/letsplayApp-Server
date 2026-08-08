import { BadRequestException, Injectable } from '@nestjs/common';
import { CurrencyType, LedgerSource } from '@prisma/client';
import { EconomyService } from '../economy/economy.service';
import { ProfilesService } from '../profiles/profiles.service';
import { AchievementsService } from '../achievements/achievements.service';
import { RewardsService } from '../rewards/rewards.service';
import { PrismaService } from '../../database/prisma.service';
import { CompleteLessonDto } from './dto/complete-lesson.dto';
import { MasterLetterDto } from './dto/master-letter.dto';
import { calculateLessonScore } from './scoring';

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profilesService: ProfilesService,
    private readonly economyService: EconomyService,
    private readonly rewardsService: RewardsService,
    private readonly achievementsService: AchievementsService,
  ) {}

  async completeLesson(
    userId: string,
    profileId: string,
    dto: CompleteLessonDto,
  ) {
    await this.profilesService.assertParentAccess(userId, profileId);
    this.validateLessonResult(dto);

    const score = calculateLessonScore(dto);

    const result = await this.prisma.$transaction(async (tx) => {
      const attempt = await tx.lessonAttempt.create({
        data: {
          profileId,
          lessonId: dto.lessonId,
          status: 'COMPLETED',
          correctAnswers: dto.correctAnswers,
          firstAttemptCorrect: dto.firstAttemptCorrect,
          totalQuestions: dto.totalQuestions,
          mistakes: dto.mistakes,
          hintsUsed: dto.hintsUsed,
          timeSpentSeconds: dto.timeSpentSeconds,
          rating: score.rating,
          completedAt: new Date(),
        },
      });

      const existingProgress = await tx.lessonProgress.findUnique({
        where: {
          profileId_lessonId: {
            profileId,
            lessonId: dto.lessonId,
          },
        },
      });

      const progress = await tx.lessonProgress.upsert({
        where: {
          profileId_lessonId: {
            profileId,
            lessonId: dto.lessonId,
          },
        },
        create: {
          profileId,
          lessonId: dto.lessonId,
          bestRating: score.rating,
          completions: 1,
          lastCompletedAt: new Date(),
        },
        update: {
          bestRating: Math.max(existingProgress?.bestRating ?? 0, score.rating),
          completions: { increment: 1 },
          lastCompletedAt: new Date(),
        },
      });

      await this.economyService.grantWithinTransaction(
        tx,
        profileId,
        CurrencyType.STARS,
        score.stars,
        LedgerSource.LESSON_COMPLETED,
        `lesson-stars:${attempt.id}`,
        score,
      );

      await this.economyService.grantWithinTransaction(
        tx,
        profileId,
        CurrencyType.XP,
        score.xp,
        LedgerSource.LESSON_COMPLETED,
        `lesson-xp:${attempt.id}`,
        score,
      );

      const streak = await this.rewardsService.recordLearningActivity(
        tx,
        profileId,
      );
      const chest = await this.rewardsService.createChestIfEligible(
        tx,
        profileId,
      );

      await tx.auditEvent.create({
        data: {
          actorUserId: userId,
          profileId,
          action: 'lesson.completed',
          metadata: {
            lessonId: dto.lessonId,
            score,
          },
        },
      });

      return { attempt, progress, streak, chest, score };
    });

    const achievements =
      await this.achievementsService.evaluateProfile(profileId);
    return { ...result, achievements };
  }

  async masterLetter(userId: string, profileId: string, dto: MasterLetterDto) {
    await this.profilesService.assertParentAccess(userId, profileId);

    const progress = await this.prisma.letterProgress.upsert({
      where: {
        profileId_letterKey: {
          profileId,
          letterKey: dto.letterKey,
        },
      },
      create: {
        profileId,
        letterKey: dto.letterKey,
        attempts: dto.attempts,
        correct: dto.correct,
        masteredAt: new Date(),
      },
      update: {
        attempts: { increment: dto.attempts },
        correct: { increment: dto.correct },
        masteredAt: new Date(),
      },
    });

    await this.prisma.inventoryItem.upsert({
      where: {
        profileId_key: {
          profileId,
          key: `letter:${dto.letterKey}`,
        },
      },
      create: {
        profileId,
        type: 'LETTER_COLLECTIBLE',
        key: `letter:${dto.letterKey}`,
        metadata: { letterKey: dto.letterKey },
      },
      update: {},
    });

    const achievements =
      await this.achievementsService.evaluateProfile(profileId);
    return { progress, achievements };
  }

  async getProgress(userId: string, profileId: string) {
    await this.profilesService.assertParentAccess(userId, profileId);

    const [lessons, letters, worlds] = await Promise.all([
      this.prisma.lessonProgress.findMany({
        where: { profileId },
        orderBy: { lastCompletedAt: 'desc' },
      }),
      this.prisma.letterProgress.findMany({
        where: { profileId },
        orderBy: { letterKey: 'asc' },
      }),
      this.prisma.inventoryItem.findMany({
        where: { profileId, type: 'WORLD' },
      }),
    ]);

    return { lessons, letters, worlds };
  }

  private validateLessonResult(dto: CompleteLessonDto) {
    if (
      dto.correctAnswers > dto.totalQuestions ||
      dto.firstAttemptCorrect > dto.correctAnswers
    ) {
      throw new BadRequestException('Lesson result counters are inconsistent.');
    }
  }
}
