import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { BadRequestDomainException } from '../../../../core/exceptions/domain/domainException';

export class AdminRefreshTokenCommand {
  constructor(public currentToken: string) {}
}

@CommandHandler(AdminRefreshTokenCommand)
export class AdminRefreshTokenUseCase implements ICommandHandler<AdminRefreshTokenCommand> {
  constructor(
    protected jwtService: JwtService,
    protected configService: ConfigService,
  ) {}

  async execute(command: AdminRefreshTokenCommand): Promise<{ accessToken: string; expiresIn: number }> {
    // Проверяем валидность текущего токена
    let payload: any;
    try {
      payload = jwt.verify(command.currentToken, this.configService.get<string>('ADMIN_JWT_SECRET_KEY')!);
    } catch (error) {
      throw BadRequestDomainException.create('Invalid or expired token');
    }

    // Проверяем, что payload содержит email (админский токен)
    if (!payload.email) {
      throw BadRequestDomainException.create('Invalid admin token');
    }

    // Генерируем новый токен с тем же email
    const newAccessToken = this.jwtService.sign(
      { email: payload.email },
      {
        secret: this.configService.get('ADMIN_JWT_SECRET_KEY'),
        expiresIn: this.configService.get('ADMIN_JWT_EXPIRES_IN', '15m'),
      },
    );

    // Получаем время жизни токена в секундах
    const expiresIn = this.getExpiresInSeconds(this.configService.get('ADMIN_JWT_EXPIRES_IN', '15m'));

    return {
      accessToken: newAccessToken,
      expiresIn,
    };
  }

  private getExpiresInSeconds(expiresIn: string): number {
    // Конвертируем строку типа "15m", "1h" в секунды
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 15 * 60; // 15 минут по умолчанию
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 15 * 60;
    }
  }
}
