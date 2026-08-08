import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConsentType, FamilyRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateChildProfileDto } from './dto/create-child-profile.dto';
import { CreateFamilyDto } from './dto/create-family.dto';

@Injectable()
export class FamiliesService {
  constructor(private readonly prisma: PrismaService) {}

  async createFamily(userId: string, dto: CreateFamilyDto) {
    return this.prisma.family.create({
      data: {
        name: dto.name,
        members: {
          create: {
            userId,
            role: FamilyRole.OWNER,
          },
        },
      },
      include: {
        members: true,
        profiles: true,
      },
    });
  }

  async createChildProfile(
    userId: string,
    familyId: string,
    dto: CreateChildProfileDto,
  ) {
    await this.assertFamilyOwner(userId, familyId);

    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.profile.create({
        data: {
          familyId,
          displayName: dto.displayName,
          birthYear: dto.birthYear,
          wallet: {
            create: {
              starsBalance: 0,
              heartsBalance: 5,
              energyBalance: 10,
              xpTotal: 0,
            },
          },
          streak: {
            create: {},
          },
        },
      });

      await tx.guardianConsent.createMany({
        data: [
          {
            guardianId: userId,
            childProfileId: profile.id,
            type: ConsentType.CHILD_ACCOUNT,
          },
          {
            guardianId: userId,
            childProfileId: profile.id,
            type: ConsentType.DATA_PROCESSING,
          },
        ],
      });

      await tx.auditEvent.create({
        data: {
          actorUserId: userId,
          profileId: profile.id,
          action: 'child_profile.created',
          metadata: { familyId },
        },
      });

      return profile;
    });
  }

  async getFamily(userId: string, familyId: string) {
    await this.assertFamilyOwner(userId, familyId);

    return this.prisma.family.findUnique({
      where: { id: familyId },
      include: {
        profiles: {
          include: {
            wallet: true,
            streak: true,
          },
        },
        members: true,
      },
    });
  }

  async assertFamilyOwner(userId: string, familyId: string) {
    const membership = await this.prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Family not found.');
    }

    if (
      membership.role !== FamilyRole.OWNER &&
      membership.role !== FamilyRole.GUARDIAN
    ) {
      throw new ForbiddenException('You do not have access to this family.');
    }
  }
}
