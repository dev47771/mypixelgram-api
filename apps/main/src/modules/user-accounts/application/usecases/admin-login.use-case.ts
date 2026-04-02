import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export class AdminLoginCommand {
  constructor(public email: string) {}
}

@CommandHandler(AdminLoginCommand)
export class AdminLoginUseCase implements ICommandHandler<AdminLoginCommand> {
  constructor(
    protected jwtService: JwtService,
    protected configService: ConfigService,
  ) {}

  async execute(command: AdminLoginCommand): Promise<{ accessToken: string; expiresIn: number }> {
    const adminJwtSecret = this.configService.get('ADMIN_JWT_SECRET_KEY');

    // Генерируем JWT токен для админа
    const accessToken = this.jwtService.sign(
      { email: command.email },
      {
        secret: adminJwtSecret,
        expiresIn: this.configService.get('ADMIN_JWT_EXPIRES_IN', '15m'),
      },
    );

    // Получаем время жизни токена в секундах
    const expiresIn = this.getExpiresInSeconds(this.configService.get('ADMIN_JWT_EXPIRES_IN', '15m'));

    return {
      accessToken,
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
