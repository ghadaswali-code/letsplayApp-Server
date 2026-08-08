import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { SignOptions } from 'jsonwebtoken';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const expiresIn = config.getOrThrow<string>(
          'jwt.expiresIn',
        ) as SignOptions['expiresIn'];

        return {
          secret: config.getOrThrow<string>('jwt.secret'),
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [IdentityController],
  providers: [IdentityService, JwtStrategy],
  exports: [IdentityService],
})
export class IdentityModule {}
