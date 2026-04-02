import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AdminLoginInput, AdminAuthResponse } from '../../graph-ql/models/admin.model';
import { AdminLocalAuthGuard } from './guards/local-strategy/admin-local-auth.guard';
import { AdminJwtAuthGuard } from './guards/jwt-strategy/admin-jwt-auth.guard';
import { AdminLoginCommand } from '../application/usecases/admin-login.use-case';
import { AdminRefreshTokenCommand } from '../application/usecases/admin-refresh-token.use-case';
import { Response } from 'express';
import { ExtractEmailFromRequest } from '../../../core/decorators/extract-email-from-request';
import { UsersPageResponse } from '../../graph-ql/models/users-page.model';
import { GetUsersArgs } from './args/get-users.args';
import { UnauthorizedDomainException } from '../../../core/exceptions/domain/domainException';
import { AdminGetUsersQuery } from '../application/queries/admin-get-users.query-handler';

@Resolver()
export class AdminResolver {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Mutation(() => AdminAuthResponse)
  @UseGuards(AdminLocalAuthGuard)
  async adminLogin(@Args('input') input: AdminLoginInput, @ExtractEmailFromRequest() email: string, @Context() { res }: { res: Response }): Promise<AdminAuthResponse> {
    // Аутентификация проходит через AdminLocalAuthGuard
    // После успешной аутентификации получаем email из request.user
    const result = await this.commandBus.execute(new AdminLoginCommand(email));
    res.cookie('adminAccessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: result.expiresIn * 1000,
      domain: '.mypixelgram.ru',
    });

    return {
      accessToken: result.accessToken,
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(AdminJwtAuthGuard)
  async adminLogout(@Context() { res }: { res: Response }): Promise<boolean> {
    res.clearCookie('adminAccessToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.mypixelgram.ru',
    });

    return true;
  }

  @Mutation(() => AdminAuthResponse)
  @UseGuards(AdminJwtAuthGuard)
  async adminRefreshToken(@Context() context: any): Promise<AdminAuthResponse> {
    const request = context.req;
    const currentToken = request.cookies?.adminAccessToken;

    if (!currentToken) {
      throw UnauthorizedDomainException.create('No admin access token found', 'adminRefreshToken');
    }

    const result = await this.commandBus.execute(new AdminRefreshTokenCommand(currentToken));

    const response: Response = context.res;
    response.cookie('adminAccessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: result.expiresIn * 1000,
      domain: '.mypixelgram.ru',
    });

    return {
      accessToken: result.accessToken,
    };
  }

  @UseGuards(AdminJwtAuthGuard)
  @Query(() => UsersPageResponse)
  async getUsers(@Args() query: GetUsersArgs, @Args('userId', { type: () => String, nullable: true }) userId?: string) {
    return await this.queryBus.execute(new AdminGetUsersQuery(query, userId));
  }
}
