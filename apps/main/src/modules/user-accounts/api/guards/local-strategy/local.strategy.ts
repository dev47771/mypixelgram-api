import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { ValidateUserUseCaseCommand } from '../../../application/usecases/validate-user.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { LoginUserDto } from '../../input-dto/login-user.input-dto';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  BadRequestDomainException,
  UnauthorizedDomainException,
} from '../../../../../core/exceptions/domainException';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private commandBus: CommandBus) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    const dto = plainToInstance(LoginUserDto, { email, password });

    try {
      await validateOrReject(dto);
    } catch (errors) {
      throw BadRequestDomainException.create(
        'Bad request data',
        'localStarategy',
      );
    }

    const user = await this.commandBus.execute(
      new ValidateUserUseCaseCommand(dto),
    );
    if (!user)
      throw UnauthorizedDomainException.create(
        'LocalStrategy not User',
        'local-strategy',
      );

    return user.userId;
  }
}
