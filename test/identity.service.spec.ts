import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../src/database/prisma.service';
import { IdentityService } from '../src/modules/identity/identity.service';

type UserCreateArgs = {
  data: {
    email: string;
    passwordHash: string;
    displayName: string;
    role: UserRole;
  };
};

type RegisteredUser = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
};

describe('IdentityService', () => {
  const jwtService = {
    sign: jest.fn().mockReturnValue('signed-token'),
  } as unknown as JwtService;

  function createService(prisma: Partial<PrismaService>) {
    return new IdentityService(prisma as PrismaService, jwtService);
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes email before checking for duplicate parent registration', async () => {
    const findUnique = jest.fn().mockResolvedValue({
      id: 'user-1',
      email: 'parent@example.com',
    });

    const service = createService({
      user: {
        findUnique,
      },
    } as Partial<PrismaService>);

    await expect(
      service.registerParent({
        email: 'Parent@Example.com',
        password: 'password123',
        displayName: 'Parent',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(findUnique).toHaveBeenCalledWith({
      where: { email: 'parent@example.com' },
    });
  });

  it('stores normalized email when registering a parent', async () => {
    const create = jest
      .fn<Promise<RegisteredUser>, [UserCreateArgs]>()
      .mockResolvedValue({
        id: 'user-1',
        email: 'parent@example.com',
        displayName: 'Parent',
        role: UserRole.PARENT,
      });

    const service = createService({
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create,
      },
    } as Partial<PrismaService>);

    await service.registerParent({
      email: ' Parent@Example.com ',
      password: 'password123',
      displayName: 'Parent',
    });

    const createArgs = create.mock.calls[0]?.[0];

    expect(createArgs?.data.email).toBe('parent@example.com');
  });

  it('normalizes email before login lookup', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const service = createService({
      user: {
        findUnique,
      },
    } as Partial<PrismaService>);

    await expect(
      service.login({
        email: ' Parent@Example.com ',
        password: 'password123',
      }),
    ).rejects.toThrow('Invalid email or password.');

    expect(findUnique).toHaveBeenCalledWith({
      where: { email: 'parent@example.com' },
    });
  });
});
