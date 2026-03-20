import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { ValidateUserCommand } from '../../../application/usecases/validate-user.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { LoginUserDto } from '../../input-dto/login-user.input-dto';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { BadRequestPresentationalException } from '../../../../../core/exceptions/presentational/presentationalException';
import { formatErrors } from '../../../../../setup/pipes.setup';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private commandBus: CommandBus) {
    super({ usernameField: 'email' });
  }
  async validate(email: string, password: string) {
    const dto = plainToInstance(LoginUserDto, { email, password });
    try {
      await validateOrReject(dto);
    } catch (errors) {
      const formattedErrors = formatErrors(errors);
      throw BadRequestPresentationalException.create(formattedErrors);
    }

    const user = await this.commandBus.execute(new ValidateUserCommand(dto));
    return user.userId;
  }
}
