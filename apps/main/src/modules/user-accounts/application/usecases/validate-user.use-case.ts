import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../infrastructure/users.repo';
import { CryptoService } from '../crypto.service';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User as UserModel } from '@prisma/client';
import { LoginUserDto } from '../../api/input-dto/login-user.input-dto';

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
    if (!user) throw new UnauthorizedException('invalid login');

    if (this.configService.get<boolean>('SKIP_PASSWORD_CHECK') === false) {
      const isPasswordValid = await this.cryptoService.comparePasswords(
        password,
        user.passwordHash,
      );
      if (!isPasswordValid)
        throw new UnauthorizedException('password email is wrong');
    }

    return { userId: user.id };
  }
}
