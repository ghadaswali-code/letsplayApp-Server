import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async assertParentAccess(userId: string, profileId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        familyId: true,
        family: {
          select: {
            members: {
              where: { userId },
              select: { role: true },
            },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found.');
    }

    if (!profile.family?.members.length) {
      throw new ForbiddenException('You do not have access to this profile.');
    }
  }

  async getDashboard(userId: string, profileId: string) {
    await this.assertParentAccess(userId, profileId);

    const [profile, lessonCount, letterCount, achievements] = await Promise.all(
      [
        this.prisma.profile.findUnique({
          where: { id: profileId },
          include: {
            wallet: true,
            streak: true,
            inventoryItems: true,
          },
        }),
        this.prisma.lessonProgress.count({ where: { profileId } }),
        this.prisma.letterProgress.count({
          where: {
            profileId,
            masteredAt: { not: null },
          },
        }),
        this.prisma.profileAchievement.findMany({
          where: { profileId },
          include: { achievement: true },
          orderBy: { awardedAt: 'desc' },
        }),
      ],
    );

    return {
      profile,
      progress: {
        completedLessons: lessonCount,
        masteredLetters: letterCount,
      },
      achievements,
    };
  }
}
