import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ValidationError,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { ValidateUserUseCaseCommand } from '../../../application/usecases/validate-user.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { LoginUserDto } from '../../input-dto/login-user.input-dto';
import { validateOrReject } from 'class-validator';
import { FieldError } from '../../../../../core/exceptions/field-error';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private commandBus: CommandBus) {
    super({ usernameField: 'email' });
  }

  formatErrors1 = (errors: ValidationError[]): FieldError[] => {
    const errorsForResponse: FieldError[] = [];
    errors.forEach((error) => {
      const field = 'login';
      for (const key in error.constraints) {
        const message = error.constraints[key];
        errorsForResponse.push({
          field,
          message,
        });
      }
    });
    return errorsForResponse;
  };

  async validate(email: string, password: string) {
    const dto = plainToInstance(LoginUserDto, { email, password });

    try {
      await validateOrReject(dto);
    } catch (errors) {
      throw new BadRequestException({ errors: this.formatErrors1(errors) });
    }

    const user = await this.commandBus.execute(
      new ValidateUserUseCaseCommand(dto),
    );
    if (!user) throw new UnauthorizedException('LocalStrategy not User');

    return user.userId;
  }
}
