import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedDomainException } from '../../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../../core/exceptions/errorConstants';

export class AdminValidateCommand {
  constructor(
    public email: string,
    public password: string,
  ) {}
}

@CommandHandler(AdminValidateCommand)
export class AdminValidateUseCase implements ICommandHandler<AdminValidateCommand> {
  constructor() {}

  async execute(command: AdminValidateCommand) {
    if (command.email !== process.env.ADMIN_EMAIL) {
      throw UnauthorizedDomainException.create(ErrorConstants.INVALID_LOGIN_OR_PASSWORD, 'AdminValidateUseCase');
    }

    if (command.password !== process.env.ADMIN_PASSWORD) {
      throw UnauthorizedDomainException.create(ErrorConstants.INVALID_LOGIN_OR_PASSWORD, 'AdminValidateUseCase');
    }
    return { email: command.email };
  }
}
