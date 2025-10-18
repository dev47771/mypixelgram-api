import { CreateUserDto } from '../../../dto/create-user.dto';
import { CreateUserRepoDto } from '../../../infrastructure/dto/create-user.repo-dto';
import { BadRequestException } from '@nestjs/common';
import { CryptoService } from '../../crypto.service';
import { UsersRepo } from '../../../infrastructure/users.repo';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../../../core/exceptions/errorConstants';

export abstract class BaseCreateUser {
  protected constructor(
    protected cryptoService: CryptoService,
    protected usersRepo: UsersRepo,
  ) {}

  async createUserDto(dto: CreateUserDto): Promise<CreateUserRepoDto> {
    const userWithSameLogin = await this.usersRepo.findByLogin(dto.login);
    if (userWithSameLogin) {
      throw BadRequestDomainException.create(
        ErrorConstants.LOGIN_ALREADY_TAKEN,
        'BaseCreateUser',
      );
    }

    const userWithSameEmail = await this.usersRepo.findByEmail(dto.email);
    if (userWithSameEmail) {
      throw BadRequestDomainException.create(
        ErrorConstants.EMAIL_ALREADY_TAKEN,
        'BaseCreateUser',
      );
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
