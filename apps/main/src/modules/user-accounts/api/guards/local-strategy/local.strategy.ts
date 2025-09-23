import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { ValidateUserUseCaseCommand } from '../../../application/usecases/validate-user.use-case';
import { CommandBus } from '@nestjs/cqrs';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private commandBus: CommandBus) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    const user: any = await this.commandBus.execute(
      new ValidateUserUseCaseCommand(email, password),
    );
    if (!user) throw new UnauthorizedException('LocalStrategy not User');

    return user.userId;
  }
}
