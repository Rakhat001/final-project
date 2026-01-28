import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { JWTStrategy } from './jwt-strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  providers: [AuthResolver, AuthService, JWTStrategy, RefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
