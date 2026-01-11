import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { ForbiddenDomainException } from '../../../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../../../core/exceptions/errorConstants';
import { CreateOrUpdateProfileDto } from '../../../api/input-dto/create-or-update-profile.input-dto';
import { UsersRepo } from '../../../infrastructure/users.repo';

export class CreateOrUpdateProfileUseCaseCommand {
  constructor(
    public userId: string,
    public dto: CreateOrUpdateProfileDto,
  ) {}
}

@CommandHandler(CreateOrUpdateProfileUseCaseCommand)
export class CreateOrUpdateUseCase implements ICommandHandler<CreateOrUpdateProfileUseCaseCommand> {
  constructor(
    protected configService: ConfigService,
    private usersRepo: UsersRepo,
  ) {}

  async execute(command: CreateOrUpdateProfileUseCaseCommand) {
    const { userId, dto } = command;

    const user = await this.usersRepo.findByIdWithProfile(userId);
    if (!user) {
      throw ForbiddenDomainException.create(ErrorConstants.FORBIDDEN, 'CreateOrUpdateProfileUseCase');
    }

    if (dto.login && dto.login !== user.login) {
      const candidate = await this.usersRepo.findByLogin(dto.login);
      if (candidate) {
        throw ForbiddenDomainException.create(ErrorConstants.LOGIN_ALREADY_TAKEN, 'CreateOrUpdateProfileUseCase');
      }

      await this.usersRepo.updateUserLogin(userId, dto.login);
    }

    return this.usersRepo.createOrUpdateProfile(userId, dto);
  }
}
