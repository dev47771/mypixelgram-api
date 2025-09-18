import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { UserViewDto } from './view-dto/user.view-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUserByIdOrInternalFailQuery } from '../application/queries/get-user-by-id-or-internal-fail.query';
import { RegisterUserCommand } from '../application/usecases/register-user.use-case';
import { LoginUserInputDto } from './input-dto/login-user.input-dto';
import { ExtractDeviceAndIpFromReq } from '../../../core/decorators/extractDeviceAndIp';
import { ExtractDeviceAndIpDto } from './input-dto/extract-device-ip.input-dto';
import { LoginUserCommand } from '../application/usecases/login-user.use-case';
import { LocalAuthGuard } from './guards/local-strategy/local-auth.guard';
import { Response } from 'express'

export const AUTH_ROUTE = 'auth';

@Controller(AUTH_ROUTE)
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registerUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    const createdUserId = await this.commandBus.execute<RegisterUserCommand, string>(new RegisterUserCommand(body));

    return this.queryBus.execute(
      new GetUserByIdOrInternalFailQuery(createdUserId),
    );
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginUser(@Body() body: LoginUserInputDto, @ExtractDeviceAndIpFromReq() dto: ExtractDeviceAndIpDto, @Res({ passthrough: true }) response: Response) {
    const tokens =  await this.commandBus.execute(new LoginUserCommand(body, dto));

    response.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true })
    return { accessToken: tokens.accessToken }
  }
}
