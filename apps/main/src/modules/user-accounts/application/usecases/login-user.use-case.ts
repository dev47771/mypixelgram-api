import { LoginUserInputDto } from '../../api/input-dto/login-user.input-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ExtractDeviceAndIpDto } from '../../api/input-dto/extract-device-ip.input-dto';
import { UsersRepo } from '../../infrastructure/users.repo';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateSessionDto } from '../../api/input-dto/create-session.input-dto';

export class LoginUserCommand {
  constructor(public dto: LoginUserInputDto, public extractDto: ExtractDeviceAndIpDto) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(protected jwtService: JwtService,
              protected configService: ConfigService,
              protected usersRepo: UsersRepo,) {}

  async execute(command: LoginUserCommand){

    const user = await this.usersRepo.findByEmail(command.dto.email)
    if(user) {
      const accessToken: string = await this.jwtService.sign({userId: user.id}, {
        secret: this.configService.get('JWT_SECRET_KEY'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '1h'),
      })

      const deviceId = uuidv4()
      const refreshToken: string = await this.jwtService.sign({ userId: user.id, deviceId: deviceId }, {
        secret: this.configService.get('JWT_SECRET_KEY'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '1h'),
      })

      const payload = jwt.verify(refreshToken, this.configService.get<string>('JWT_SECRET_KEY')!) as {userId: string, deviceId: string, iat: number, exp: number}
      const iat_Date: string = new Date(payload.iat * 1000).toISOString()
      const exp_Date: string = new Date(payload.exp * 1000).toISOString()

      const sessionDto: CreateSessionDto = {
        userId: payload.userId,
        ip: command.extractDto.ip,
        iat: iat_Date,
        exp: exp_Date,
        deviceName: command.extractDto.device,
        deviceId: payload.deviceId
      }


    }


    return
  }
}