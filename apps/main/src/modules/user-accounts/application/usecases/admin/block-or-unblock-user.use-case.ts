import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlockOrUnblockUserArgs } from '../../../api/args/block-or-unblock-user.args';
import { UsersRepo } from '../../../infrastructure/users.repo';
import { BadRequestDomainException, NotFoundDomainException } from '../../../../../core/exceptions/domain/domainException';

export class BlockOrUnblockUserCommand {
  constructor(public body: BlockOrUnblockUserArgs) {}
}

@CommandHandler(BlockOrUnblockUserCommand)
export class BlockOrUnblockUserUseCase implements ICommandHandler<BlockOrUnblockUserCommand> {
  constructor(private readonly usersRepository: UsersRepo) {}

  async execute(command: BlockOrUnblockUserCommand) {
    const user = await this.usersRepository.findUserByIdWithBlockInfo(command.body.id);
    this.validateUser(user, command.body);

    if (command.body.reasonId) {
      await this.blockUser(command.body);
    } else {
      // reasonId нет, значит user.blockInfo точно есть (проверили выше)
      await this.usersRepository.unblockUser(command.body.id);
    }

    return true;
  }

  private validateUser(user: any, body: BlockOrUnblockUserArgs) {
    if (!user) {
      throw NotFoundDomainException.create('User not found', 'User');
    }

    if (body.reasonId && user.blockInfo) {
      throw BadRequestDomainException.create('User is already blocked');
    }

    if (!body.reasonId && !user.blockInfo) {
      throw BadRequestDomainException.create('User is already unblocked');
    }
  }

  private async blockUser(body: BlockOrUnblockUserArgs) {
    // reasonId есть, значит user.blockInfo точно нет (проверили выше)
    if (body.reasonId === 3 && !body.reasonDetail) {
      throw BadRequestDomainException.create('reasonDetail is required', 'reasonDetail');
    }
    await this.usersRepository.blockUser(body.id, body.reasonId!, body.reasonDetail);
  }
}
