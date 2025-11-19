import { Controller, Get, Param } from '@nestjs/common';
import { ViewTotalCountData } from './view-dto/user.view-dto';
import { QueryBus } from '@nestjs/cqrs';
import { PUBLIC_USERS_ROUTE } from '../domain/constants';
import { GetTotalConfirmedUsersQuery } from '../application/queries/get-total-confirmed-users.query';
import { GetProfileByLoginQuery } from '../application/queries/getProfileByLogin';
import { ProfileViewDto } from './view-dto/profile-view.dto';

@Controller(PUBLIC_USERS_ROUTE)
export class PublicUsersController {
  constructor(private queryBus: QueryBus) {}

  @Get('total-count')
  async getTotalCount(): Promise<ViewTotalCountData> {
    const totalCount = await this.queryBus.execute(new GetTotalConfirmedUsersQuery());
    return { totalCount };
  }

  @Get('profile/:login')
  async getProfileById(@Param('login') login: string): Promise<ProfileViewDto> {
    return this.queryBus.execute(new GetProfileByLoginQuery(login));
  }
}
