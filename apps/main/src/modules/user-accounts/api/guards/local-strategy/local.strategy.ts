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
} from '../../../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../../../core/exceptions/errorConstants';
import {
  BadRequestPresentationalException,
  PresentationErrorExtension,
  PresentationException,
} from '../../../../../core/exceptions/presentational/presentationalException';
import { formatErrors } from '../../../../../setup/pipes.setup';

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
      const formattedErrors = formatErrors(errors);
      throw BadRequestPresentationalException.createMany(formattedErrors);
    }

    const user = await this.commandBus.execute(
      new ValidateUserUseCaseCommand(dto),
    );
    return user.userId;
  }
}
