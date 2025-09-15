import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { UserViewDto } from './view-dto/user.view-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUserByIdOrInternalFailQuery } from '../application/queries/get-user-by-id-or-internal-fail.query';
import { RegisterUserCommand } from '../application/usecases/register-user.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Post('register')
  async registerUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    const createdUserId = await this.commandBus.execute<
      RegisterUserCommand,
      number
    >(new RegisterUserCommand(body));

    return this.queryBus.execute(
      new GetUserByIdOrInternalFailQuery(createdUserId),
    );
  }
}
