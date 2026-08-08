import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async mvpSummary() {
    const [profiles, completedLessons, activeStreaks, dailyClaims] =
      await Promise.all([
        this.prisma.profile.count(),
        this.prisma.lessonAttempt.count({ where: { status: 'COMPLETED' } }),
        this.prisma.streak.count({ where: { currentDays: { gt: 0 } } }),
        this.prisma.dailyRewardClaim.count(),
      ]);

    return {
      profiles,
      completedLessons,
      activeStreaks,
      dailyClaims,
    };
  }
}
