import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    } as any);
  }

  async validate(req: Request, payload: any) {
    const authHeader = req.get('Authorization');
    const refreshToken = authHeader ? authHeader.replace('Bearer', '').trim() : '';
    
    const user = await this.usersService.findOne(payload.sub);
    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.hashedRefreshToken,
    );

    if (!refreshTokenMatches) {
        throw new ForbiddenException('Access Denied');
    }

    return user;
  }
}
