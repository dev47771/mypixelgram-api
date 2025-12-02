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
    const userByLogin = await this.usersRepo.findByLogin(dto.login);
    if (!userByLogin || userByLogin.id !== userId) {
      throw ForbiddenDomainException.create(ErrorConstants.FORBIDDEN, 'CreateOrUpdateProfileUseCase');
    }
    return this.usersRepo.createOrUpdateProfile(userId, dto);
  }
}
