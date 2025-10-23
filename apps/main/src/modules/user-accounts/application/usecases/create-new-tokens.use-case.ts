import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SessionRepo } from '../../sessions/infrastructure/sessions.repo';
import { RefreshTokenPayloadDto } from '../../sessions/api/dto/refresh-token-payload.dto';
import * as jwt from 'jsonwebtoken';

export class RefreshTokenCommand {
  constructor(public payload: RefreshTokenPayloadDto) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    protected jwtService: JwtService,
    protected configService: ConfigService,
    protected sessionRepo: SessionRepo,
  ) {}

  async execute(
    command: RefreshTokenCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken: string = this.jwtService.sign(
      { userId: command.payload.userId },
      {
        secret: this.configService.get('JWT_SECRET_KEY'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '1h'),
      },
    );

    const refreshToken: string = this.jwtService.sign(
      { userId: command.payload.userId, deviceId: command.payload.deviceId },
      {
        secret: this.configService.get('JWT_SECRET_KEY'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '1h'),
      },
    );
    const payload = jwt.verify(
      refreshToken,
      this.configService.get<string>('JWT_SECRET_KEY')!,
    ) as { userId: string; deviceId: string; iat: number; exp: number };

    const iat_Date: string = new Date(payload.iat * 1000).toISOString();
    const exp_Date: string = new Date(payload.exp * 1000).toISOString();

    await this.sessionRepo.updateSessionByDeviceId(payload.deviceId, {
      userId: payload.userId,
      iat: iat_Date,
      exp: exp_Date,
      // deviceName и ip взять из исходного payload, если нужно
    });

    return { accessToken: accessToken, refreshToken: refreshToken };
  }
}
