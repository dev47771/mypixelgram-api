import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ExtractDeviceAndIpDto } from '../../api/input-dto/extract-device-ip.input-dto';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { CreateSessionDto } from '../../api/input-dto/create-session.input-dto';
import { SessionRepo } from '../../sessions/infrastructure/sessions.repo';

export class LoginUserCommand {
  constructor(public extractDto: ExtractDeviceAndIpDto) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    protected jwtService: JwtService,
    protected configService: ConfigService,
    protected sessionRepo: SessionRepo,
  ) {}

  async execute(
    command: LoginUserCommand,
  ): Promise<{ accessToken: string; refreshToken: string } | undefined> {
    const accessToken: string = this.jwtService.sign(
      { userId: command.extractDto.userId },
      {
        secret: this.configService.get('JWT_SECRET_KEY'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '1h'),
      },
    );

    const deviceId = uuidv4();
    const refreshToken: string = this.jwtService.sign(
      { userId: command.extractDto.userId, deviceId: deviceId },
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

    const sessionDto: CreateSessionDto = {
      userId: payload.userId,
      ip: command.extractDto.ip,
      iat: iat_Date,
      exp: exp_Date,
      deviceName: command.extractDto.device,
      deviceId: payload.deviceId,
    };

    await this.sessionRepo.createSession(sessionDto);

    return {
      accessToken,
      refreshToken,
    };
  }
}
