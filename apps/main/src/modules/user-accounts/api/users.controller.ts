import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserViewDto } from './view-dto/user.view-dto';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/usecases/create-user.use-case';
import { GetUserByIdOrInternalFailQuery } from '../application/queries/get-user-by-id-or-internal-fail.query';
import { BasicAuthGuard } from './guards/basic/basic-auth.guard';
import { IntValidationTransformationPipe } from '../../../core/pipes/int-validation-transformation.pipe';
import { GetUserOrNotFoundFailQuery } from '../application/queries/get-user-or-not-found-fail.query';
import { USERS_ROUTE } from '../domain/constants';
import {
  ApiBasicAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { DomainExeptionDto } from '../../../core/exceptions/domainException.dto';
import { ApiCreate, ApiGetById } from './decorators/user.swagger.decorators';
import { CreateUserDto } from '../dto/create-user.dto';

@ApiBasicAuth()
@Controller(USERS_ROUTE)
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Post()
  @ApiCreate(
    'Сreates a user in the system',
    CreateUserInputDto,
    UserViewDto,
    DomainExeptionDto,
  )
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    const createdUserId = await this.commandBus.execute(
      new CreateUserCommand(body),
    );

    return this.queryBus.execute(
      new GetUserByIdOrInternalFailQuery(createdUserId),
    );
  }

  @Get(':id')
  @ApiGetById('Return user by id', UserViewDto)
  async getUser(
    @Param('id', IntValidationTransformationPipe) id: string,
  ): Promise<UserViewDto> {
    return this.queryBus.execute(new GetUserOrNotFoundFailQuery(id));
  }
}
