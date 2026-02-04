import { UsersRepo } from '../../infrastructure/users.repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestDomainException } from '../../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../../core/exceptions/errorConstants';
import { TransportService } from '../../../transport/transport.service';

export class CancelSubscriptionCommand {
  constructor(public userId: string) {}
}
@CommandHandler(CancelSubscriptionCommand)
export class CancelSubscriptionUseCase implements ICommandHandler<CancelSubscriptionCommand> {
  constructor(
    private usersRepo: UsersRepo,
    private transportService: TransportService,
  ) {}

  async execute(command: CancelSubscriptionCommand) {
    const user = await this.usersRepo.findById(command.userId);

    if (!user?.planName) {
      throw BadRequestDomainException.create(ErrorConstants.PAYMENT_NOT_FOUND, 'CancelSubscriptionCommand');
    }

    await this.transportService.cancelStripeSubscription({
      userId: command.userId,
    });

    await this.usersRepo.updateSubscription(command.userId, null, null, 'PERSONAL');

    return { success: true };
  }
}
