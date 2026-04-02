import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UnauthorizedDomainException } from '../exceptions/domain/domainException';

export const ExtractEmailFromRequest = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const gqlContext = GqlExecutionContext.create(ctx);

  if (gqlContext.getContext()) {
    const user = gqlContext.getContext().req?.user;
    if (!user?.email) {
      throw UnauthorizedDomainException.create('User not authenticated', 'ExtractEmailFromRequest');
    }
    return user.email;
  }
});
