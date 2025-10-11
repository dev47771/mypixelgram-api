import {
  CanActivate,
  ExecutionContext,
  Injectable, LOG_LEVELS,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SessionRepo } from '../../../sessions/infrastructure/sessions.repo';
import { Request } from 'express';
import { UnauthorizedDomainException } from '../../../../../core/exceptions/domainException';

@Injectable()
export class RefreshAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private sessionRepo: SessionRepo,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    /////////////////////// проверяем если токен ///////////////////////
    if (!request.cookies)
      throw UnauthorizedDomainException.create('no cookie', 'refreshGuard');

    const refreshToken = request.cookies.refreshToken;

    try {
      ////////////////// расчехляем токен и достаем данные //////////////////
      const payload = await this.jwtService.verify(refreshToken, {
        secret: 'jwt-secret',
      });

      /////////////////// ищем открытую сессию этого токена  /////////////////////
      const session = await this.sessionRepo.findByDeviceId(payload.deviceId);
      /////////////////// если нет сессии ошибка, нужно логиниться ////////////////
      if (!session)
        throw UnauthorizedDomainException.create(
          'refresh token expire',
          'refreshGuard',
        );

      ////////// если есть открытая сессия сравниваем версию токена и сессии по IAT дате ////////
      const payloadIat = new Date(payload.iat * 1000).toISOString();

      ////////// если токен не от этой сессии то ошибка нужно залогиниться /////////////
      if (session.iat !== payloadIat)
        throw UnauthorizedDomainException.create(
          'refresh token invalid',
          'refreshGuard',
        );

      /////////// если от этой то записываем payload в request и пропускаем //////////////
      request['payload'] = payload;
    } catch (e) {
      throw UnauthorizedDomainException.create(
        'refreshToken expire',
        'refreshGuard',
      );
    }

    return true;
  }
}
