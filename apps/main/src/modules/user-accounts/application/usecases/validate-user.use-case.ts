import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../infrastructure/users.repo';
import { CryptoService } from '../crypto.service';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User as UserModel } from '@prisma/client';
import { LoginUserDto } from '../../api/input-dto/login-user.input-dto';
import { UnauthorizedDomainException } from '../../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../../core/exceptions/errorConstants';

export class ValidateUserUseCaseCommand {
  constructor(public dto: LoginUserDto) {}
}

@CommandHandler(ValidateUserUseCaseCommand)
export class ValidateUserUseCase
  implements ICommandHandler<ValidateUserUseCaseCommand>
{
  constructor(
    private usersRepo: UsersRepo,
    private configService: ConfigService,
    private cryptoService: CryptoService,
  ) {}

  async execute(command: ValidateUserUseCaseCommand) {
    const { email, password } = command.dto;

    const user: UserModel | null = await this.usersRepo.findByEmail(email);
    if (!user)
      throw UnauthorizedDomainException.create(
        ErrorConstants.USER_NOT_FOUND,
        'ValidateUserUseCase',
      );

    await this.usersRepo.checkConfirmed(user);

    const isPasswordValid = await this.cryptoService.comparePasswords(
      password,
      user.passwordHash!,
    );

    if (!isPasswordValid) {
      throw UnauthorizedDomainException.create(
        ErrorConstants.INVALID_PASSWORD,
        'ValidateUserUseCase',
      );
    }

    return { userId: user.id };
  }
}
