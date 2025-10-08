import { Controller, Get, Param } from '@nestjs/common';
import { UserViewDto } from './view-dto/user.view-dto';
import { QueryBus } from '@nestjs/cqrs';
import { IntValidationTransformationPipe } from '../../../core/pipes/int-validation-transformation.pipe';
import { GetUserOrNotFoundFailQuery } from '../application/queries/get-user-or-not-found-fail.query';
import { USERS_ROUTE } from '../domain/constants';
import { ApiGetById } from './decorators/user.swagger.decorators';

@Controller(USERS_ROUTE)
export class UsersController {
  constructor(private queryBus: QueryBus) {}

  @Get(':id')
  @ApiGetById('Return user by id', UserViewDto)
  async getUser(
    @Param('id', IntValidationTransformationPipe) id: string,
  ): Promise<UserViewDto> {
    return this.queryBus.execute(new GetUserOrNotFoundFailQuery(id));
  }
}
