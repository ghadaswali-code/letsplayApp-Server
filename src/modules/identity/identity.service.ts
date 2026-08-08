import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterParentDto } from './dto/register-parent.dto';

@Injectable()
export class IdentityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerParent(dto: RegisterParentDto) {
    const email = this.normalizeEmail(dto.email);
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ConflictException('Email is already registered.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: dto.displayName,
        role: UserRole.PARENT,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
      },
    });

    return {
      user,
      accessToken: this.sign(user),
    };
  }

  async login(dto: LoginDto) {
    const email = this.normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
      accessToken: this.sign(user),
    };
  }

  private sign(user: { id: string; email: string; role: UserRole }) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }
}
