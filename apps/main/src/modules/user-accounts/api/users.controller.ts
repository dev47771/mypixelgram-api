import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UserViewDto } from './view-dto/user.view-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { IntValidationTransformationPipe } from '../../../core/pipes/int-validation-transformation.pipe';
import { USERS_ROUTE } from '../domain/constants';
import { ApiGetById, CreateOrUpdateProfileSwagger, DeleteUserAvatarSwagger, GetUserProfileSwagger } from './decorators/user.swagger.decorators';
import { GetUserByIdQuery } from '../application/queries/get-user-by-id.query';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-strategy/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request';
import { ExtractDeviceAndIpDto } from './input-dto/extract-device-ip.input-dto';
import { CreateOrUpdateProfileDto } from './input-dto/create-or-update-profile.input-dto';
import { CreateOrUpdateProfileUseCaseCommand } from '../application/usecases/profiles/create-or-update-profile.use-case';
import { DeletePostSwagger } from '../../posts/decorators/post.swagger.decorators';
import { DeletePostCommand } from '../../posts/application/delete-post.use-case';
import { DeleteUserAvatarCommand } from '../application/usecases/profiles/delete-user-avatar.use-case';
import { GetUserProfileQuery } from '../infrastructure/query/get-profile.query.handler';
import { GetProfileOutputDto } from './view-dto/profile-view.dto';
import { TransportService } from '../../transport/transport.service';

@Controller(USERS_ROUTE)
export class UsersController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @GetUserProfileSwagger()
  async getUserProfile(@ExtractUserFromRequest() dto: ExtractDeviceAndIpDto): Promise<GetProfileOutputDto | null> {
    return await this.queryBus.execute(new GetUserProfileQuery(dto.userId));
  }

  @Get(':id')
  @ApiGetById('Return user by id', UserViewDto)
  async getUser(@Param('id', IntValidationTransformationPipe) id: string): Promise<UserViewDto> {
    return this.queryBus.execute(new GetUserByIdQuery(id));
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @CreateOrUpdateProfileSwagger()
  async createOrUpdateUserProfile(@ExtractUserFromRequest() dto: ExtractDeviceAndIpDto, @Body() createOrUpdateProfileDto: CreateOrUpdateProfileDto) {
    return await this.commandBus.execute(new CreateOrUpdateProfileUseCaseCommand(dto.userId, createOrUpdateProfileDto));
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete('profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeleteUserAvatarSwagger()
  async deletedProfileById(@ExtractUserFromRequest() dto: ExtractDeviceAndIpDto) {
    return await this.commandBus.execute(new DeleteUserAvatarCommand(dto.userId));
  }
}
