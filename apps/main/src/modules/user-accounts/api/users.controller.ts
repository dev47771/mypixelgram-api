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
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { DomainExeptionDto } from '../../../core/exceptions/domainException.dto';

@Controller(USERS_ROUTE)
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Create user',
    description: 'Сreates a user in the system',
  })
  @ApiResponse({
    status: 201,
    description: 'The user was successfully created',
    type: UserViewDto,
  })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
    type: DomainExeptionDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  @ApiBody({ type: CreateUserInputDto })
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    const createdUserId = await this.commandBus.execute<
      CreateUserCommand,
      string
    >(new CreateUserCommand(body));

    return this.queryBus.execute(
      new GetUserByIdOrInternalFailQuery(createdUserId),
    );
  }

  @ApiOperation({
    summary: 'Return user by id',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: UserViewDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
  })
  @Get(':id')
  @ApiParam({ name: 'id', type: 'string', description: 'ID user' })
  async getUser(
    @Param('id', IntValidationTransformationPipe) id: string,
  ): Promise<UserViewDto> {
    return this.queryBus.execute(new GetUserOrNotFoundFailQuery(id));
  }
}
