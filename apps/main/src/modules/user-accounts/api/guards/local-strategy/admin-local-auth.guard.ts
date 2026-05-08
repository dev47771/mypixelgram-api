import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AdminValidateCommand } from '../../../application/usecases/admin/admin-validate.use-case';
import { UnauthorizedDomainException } from '../../../../../core/exceptions/domain/domainException';

@Injectable()
export class AdminLocalAuthGuard implements CanActivate {
  constructor(private commandBus: CommandBus) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const args = ctx.getArgs();
    const input = args.input;

    if (!input?.email || !input?.password) {
      throw UnauthorizedDomainException.create('Email and password are required', 'AdminLocalAuthGuard');
    }

    try {
      const user = await this.commandBus.execute(new AdminValidateCommand(input.email, input.password));

      // Сохраняем пользователя в request
      const request = ctx.getContext().req;
      request.user = user;

      return true;
    } catch (error) {
      throw UnauthorizedDomainException.create('Invalid credentials', 'AdminLocalAuthGuard');
    }
  }
}
