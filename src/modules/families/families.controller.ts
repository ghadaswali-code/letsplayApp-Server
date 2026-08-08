import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateChildProfileDto } from './dto/create-child-profile.dto';
import { CreateFamilyDto } from './dto/create-family.dto';
import { FamiliesService } from './families.service';

@ApiTags('families')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('families')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Post()
  @Roles(UserRole.PARENT)
  createFamily(@CurrentUser() user: RequestUser, @Body() dto: CreateFamilyDto) {
    return this.familiesService.createFamily(user.id, dto);
  }

  @Post(':familyId/children')
  @Roles(UserRole.PARENT)
  createChild(
    @CurrentUser() user: RequestUser,
    @Param('familyId') familyId: string,
    @Body() dto: CreateChildProfileDto,
  ) {
    return this.familiesService.createChildProfile(user.id, familyId, dto);
  }

  @Get(':familyId')
  @Roles(UserRole.PARENT)
  getFamily(
    @CurrentUser() user: RequestUser,
    @Param('familyId') familyId: string,
  ) {
    return this.familiesService.getFamily(user.id, familyId);
  }
}
