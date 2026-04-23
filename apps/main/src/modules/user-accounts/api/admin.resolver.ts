import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AdminLoginInput } from '../../graph-ql/models/admin.model';
import { AdminLocalAuthGuard } from './guards/local-strategy/admin-local-auth.guard';
import { AdminJwtAuthGuard } from './guards/jwt-strategy/admin-jwt-auth.guard';
import { AdminLoginCommand } from '../application/usecases/admin/admin-login.use-case';
import { AdminRefreshTokenCommand } from '../application/usecases/admin/admin-refresh-token.use-case';
import { Response } from 'express';
import { ExtractEmailFromRequest } from '../../../core/decorators/extract-email-from-request';
import { UsersPageResponse } from '../../graph-ql/models/users-page.model';
import { GetUsersArgs } from './args/get-users.args';
import { UnauthorizedDomainException } from '../../../core/exceptions/domain/domainException';
import { AdminGetUsersQuery } from '../application/queries/admin-get-users.query-handler';
import { BlockOrUnblockUserCommand } from '../application/usecases/admin/block-or-unblock-user.use-case';

@Resolver()
export class AdminResolver {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Mutation(() => Boolean, { description: 'Авторизация администратора' })
  @UseGuards(AdminLocalAuthGuard)
  async adminLogin(@Args('input') input: AdminLoginInput, @ExtractEmailFromRequest() email: string, @Context() { res }: { res: Response }) {
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

    return true;
  }

  @Mutation(() => Boolean, { description: 'Выход из учётной записи администратора' })
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

  @Mutation(() => Boolean, { description: 'Обновление токена администратора' })
  @UseGuards(AdminJwtAuthGuard)
  async adminRefreshToken(@Context() context: any) {
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

    return true;
  }

  @UseGuards(AdminJwtAuthGuard)
  @Query(() => UsersPageResponse, { description: 'Запрос списка пользователей с фильтрацией и пагинацией или одного пользователя' })
  async getUsers(@Args() query: GetUsersArgs, @Args('userId', { type: () => String, description: 'ID конкретного пользователя для получения одного результата', nullable: true }) userId?: string) {
    return await this.queryBus.execute(new AdminGetUsersQuery(query, userId));
  }

  @UseGuards(AdminJwtAuthGuard)
  @Query(() => Boolean, { description: 'Запрос на проверку прав администратора' })
  async AdminChecker() {
    return true;
  }

  @Mutation(() => Boolean, { description: 'Блокировка/разблокировка пользователя. При блокировке обязательно должны присутствовать userId, reasonId. при разблокировке передавать только userId ' })
  @UseGuards(AdminJwtAuthGuard)
  async blockUser(
    @Args('id') id: string,
    @Args('reasonId', { nullable: true, description: 'Причина блокировки: 1 - bad behavior, 2 - Advertising placement, 3 - Another reason' }) reasonId?: number,
    @Args('reasonDetail', { nullable: true, description: 'Обязательно указывать если причина блокировки Another reason' }) reasonDetail?: string,
  ) {
    return await this.commandBus.execute(new BlockOrUnblockUserCommand({ id, reasonId, reasonDetail }));
  }
}
