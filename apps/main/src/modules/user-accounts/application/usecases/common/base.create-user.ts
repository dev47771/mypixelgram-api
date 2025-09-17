import { CreateUserDto } from '../../../dto/create-user.dto';
import { CreateUserRepoDto } from '../../../infrastructure/dto/create-user.repo-dto';
import { BadRequestException } from '@nestjs/common';
import { CryptoService } from '../../crypto.service';
import { UsersRepo } from '../../../infrastructure/users.repo';

export abstract class BaseCreateUser {
  protected constructor(
    protected cryptoService: CryptoService,
    protected usersRepo: UsersRepo,
  ) {}

  async createUser(dto: CreateUserDto): Promise<CreateUserRepoDto> {
    const userWithSameLogin = await this.usersRepo.findByLogin(dto.login);
    if (userWithSameLogin) {
      throw new BadRequestException({
        errors: [
          {
            field: 'login',
            message: 'Login is already taken',
          },
        ],
      });
    }

    const userWithSameEmail = await this.usersRepo.findByEmail(dto.email);
    if (userWithSameEmail) {
      throw new BadRequestException({
        errors: [
          {
            field: 'email',
            message: 'Email is already taken',
          },
        ],
      });
    }

    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.password,
    );

    return {
      login: dto.login,
      email: dto.email,
      passwordHash,
    };
  }
}
