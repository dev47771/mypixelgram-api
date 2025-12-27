import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { ViewTotalCountData } from './view-dto/user.view-dto';
import { QueryBus } from '@nestjs/cqrs';
import { PUBLIC_USERS_ROUTE } from '../domain/constants';
import { GetTotalConfirmedUsersQuery } from '../application/queries/get-total-confirmed-users.query';
import { GetProfileByLoginQuery } from '../application/queries/getProfileByLogin';
import { ProfileViewDto } from './view-dto/profile-view.dto';
import { GetCountriesWithCitiesQuery } from '../application/queries/get-countries-with-cities.query';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { GetCountriesWithCitiesSwagger, GetProfileByLoginSwagger, GetTotalConfirmedUsersSwagger } from './decorators/user.swagger.decorators';

@Controller(PUBLIC_USERS_ROUTE)
export class PublicUsersController {
  constructor(private queryBus: QueryBus) {}

  @Get('total-count')
  @GetTotalConfirmedUsersSwagger()
  async getTotalCount(): Promise<ViewTotalCountData> {
    const totalCount = await this.queryBus.execute(new GetTotalConfirmedUsersQuery());
    return { totalCount };
  }
  @Get('profile/:login')
  @GetProfileByLoginSwagger()
  async getProfileById(@Param('login') login: string): Promise<ProfileViewDto> {
    return this.queryBus.execute(new GetProfileByLoginQuery(login));
  }
  @Get('getCountriesWithCities')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('get-countries')
  @GetCountriesWithCitiesSwagger()
  async getCountriesWithCities() {
    return this.queryBus.execute(new GetCountriesWithCitiesQuery());
  }
}
