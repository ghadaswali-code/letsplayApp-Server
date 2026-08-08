import { BadRequestException, Injectable } from '@nestjs/common';
import { CurrencyType, LedgerSource, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

type Transaction = Prisma.TransactionClient;

@Injectable()
export class EconomyService {
  constructor(private readonly prisma: PrismaService) {}

  async grant(
    profileId: string,
    currency: CurrencyType,
    amount: number,
    source: LedgerSource,
    idempotencyKey: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    return this.prisma.$transaction((tx) =>
      this.grantWithinTransaction(
        tx,
        profileId,
        currency,
        amount,
        source,
        idempotencyKey,
        metadata,
      ),
    );
  }

  async spendStars(
    profileId: string,
    amount: number,
    source: LedgerSource,
    idempotencyKey: string,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero.');
    }

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { profileId } });
      if (!wallet || wallet.starsBalance < amount) {
        throw new BadRequestException('Insufficient stars balance.');
      }

      return this.grantWithinTransaction(
        tx,
        profileId,
        CurrencyType.STARS,
        -amount,
        source,
        idempotencyKey,
      );
    });
  }

  async grantWithinTransaction(
    tx: Transaction,
    profileId: string,
    currency: CurrencyType,
    amount: number,
    source: LedgerSource,
    idempotencyKey: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    if (amount === 0) {
      return tx.wallet.findUniqueOrThrow({ where: { profileId } });
    }

    const existing = await tx.walletLedger.findUnique({
      where: {
        profileId_currency_idempotencyKey: {
          profileId,
          currency,
          idempotencyKey,
        },
      },
    });

    if (existing) {
      return tx.wallet.findUniqueOrThrow({ where: { profileId } });
    }

    await tx.walletLedger.create({
      data: {
        profileId,
        currency,
        amount,
        source,
        idempotencyKey,
        metadata,
      },
    });

    const data = this.balanceUpdate(currency, amount);
    return tx.wallet.update({
      where: { profileId },
      data,
    });
  }

  private balanceUpdate(
    currency: CurrencyType,
    amount: number,
  ): Prisma.WalletUpdateInput {
    switch (currency) {
      case CurrencyType.STARS:
        return { starsBalance: { increment: amount } };
      case CurrencyType.HEARTS:
        return { heartsBalance: { increment: amount } };
      case CurrencyType.ENERGY:
        return { energyBalance: { increment: amount } };
      case CurrencyType.XP:
        return { xpTotal: { increment: amount } };
    }
  }
}
