import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as jwt from 'jsonwebtoken';
import { UnauthorizedDomainException } from '../../../../../core/exceptions/domain/domainException';

@Injectable()
export class AdminJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;

    // Извлекаем токен из куки
    const token = request.cookies?.adminAccessToken;
    if (!token) {
      throw UnauthorizedDomainException.create('Access token not found', 'AdminJwtAuthGuard');
    }

    // Валидируем токен
    const secret = this.configService.get<string>('ADMIN_JWT_SECRET_KEY');
    if (!secret) {
      throw UnauthorizedDomainException.create('ADMIN_JWT_SECRET_KEY is not configured', 'AdminJwtAuthGuard');
    }

    let payload: any;

    try {
      const payload = jwt.verify(token, secret);

      // Проверяем наличие email в payload
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw UnauthorizedDomainException.create('Invalid or expired admin token', 'AdminJwtAuthGuard');
    }

    if (!payload || typeof payload !== 'object' || !('email' in payload)) {
      throw UnauthorizedDomainException.create('Invalid admin token payload', 'AdminJwtAuthGuard');
    }

    // Устанавливаем пользователя в request
    request.user = { email: payload.email };
    return true;
  }
}
